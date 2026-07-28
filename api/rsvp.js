import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, getIp } from "./_rateLimit.js";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_SUBMISSIONS = 6;

const CONFIRMADO_VALUES = new Set(["sim", "nao", "talvez"]);
// Mesmo formato produzido por src/lib/phone.js: "DD 9 DDDD-DDDD".
const PHONE_RE = /^\d{2} 9 \d{4}-\d{4}$/;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_PHOTO_BYTES = 6 * 1024 * 1024;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido" });
    return;
  }

  const ip = getIp(req);
  const rateLimit = checkRateLimit(`rsvp:${ip}`, { max: MAX_SUBMISSIONS, windowMs: WINDOW_MS });
  if (!rateLimit.allowed) {
    res.status(429).json({
      error: `Muitas tentativas. Tente novamente em alguns minutos.`,
    });
    return;
  }

  const body = req.body ?? {};
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  const telefone = typeof body.telefone === "string" ? body.telefone.trim() : "";
  const observacao = typeof body.observacao === "string" ? body.observacao.trim() : "";
  const confirmado = typeof body.confirmado === "string" ? body.confirmado : "";
  const photo = body.photo;

  if (!nome || nome.length > 200) {
    res.status(400).json({ error: "Nome inválido" });
    return;
  }
  if (!CONFIRMADO_VALUES.has(confirmado)) {
    res.status(400).json({ error: "Confirmação inválida" });
    return;
  }
  if (telefone && !PHONE_RE.test(telefone)) {
    res.status(400).json({ error: "Telefone inválido" });
    return;
  }
  if (observacao.length > 1000) {
    res.status(400).json({ error: "Observação muito longa" });
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    res.status(500).json({ error: "Integração com Supabase não configurada no servidor" });
    return;
  }
  const supabase = createClient(supabaseUrl, serviceKey);

  let fotoPath = null;
  if (photo && typeof photo === "object") {
    const { filename, contentType, data } = photo;
    if (
      !filename ||
      typeof filename !== "string" ||
      !contentType ||
      !ALLOWED_TYPES.has(contentType) ||
      !data ||
      typeof data !== "string"
    ) {
      res.status(400).json({ error: "Foto inválida" });
      return;
    }

    let buffer;
    try {
      buffer = Buffer.from(data, "base64");
    } catch {
      res.status(400).json({ error: "Foto inválida" });
      return;
    }
    if (buffer.length === 0 || buffer.length > MAX_PHOTO_BYTES) {
      res.status(400).json({ error: "Foto muito grande" });
      return;
    }

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("fotos-presenca")
      .upload(path, buffer, { contentType });
    if (uploadError) {
      res.status(500).json({ error: "Não foi possível enviar a foto. Tente novamente." });
      return;
    }
    fotoPath = path;
  }

  const { error: insertError } = await supabase.from("rsvps").insert({
    nome,
    telefone: telefone || null,
    observacao: observacao || null,
    confirmado,
    foto_path: fotoPath,
  });

  if (insertError) {
    if (fotoPath) await supabase.storage.from("fotos-presenca").remove([fotoPath]);
    if (insertError.code === "23505") {
      res.status(409).json({
        error: "Esse telefone já confirmou presença antes. Se precisar mudar algo, fale direto com a gente.",
      });
      return;
    }
    res.status(500).json({ error: "Não foi possível enviar. Tente novamente." });
    return;
  }

  res.status(200).json({ ok: true });
}

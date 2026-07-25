import { createClient } from "@supabase/supabase-js";
import { verifyAdminPassword } from "./_auth.js";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_BYTES = 6 * 1024 * 1024;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido" });
    return;
  }

  if (!verifyAdminPassword(req, res)) return;

  const { filename, contentType, data } = req.body ?? {};
  if (
    !filename ||
    typeof filename !== "string" ||
    !contentType ||
    !ALLOWED_TYPES.has(contentType) ||
    !data ||
    typeof data !== "string"
  ) {
    res.status(400).json({ error: "Arquivo inválido" });
    return;
  }

  let buffer;
  try {
    buffer = Buffer.from(data, "base64");
  } catch {
    res.status(400).json({ error: "Arquivo inválido" });
    return;
  }

  if (buffer.length === 0 || buffer.length > MAX_BYTES) {
    res.status(400).json({ error: "Arquivo muito grande" });
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    res.status(500).json({ error: "Integração com Supabase não configurada no servidor" });
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

  const { error } = await supabase.storage.from("fotos-festa").upload(path, buffer, { contentType });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ ok: true, path });
}

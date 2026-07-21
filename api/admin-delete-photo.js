import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido" });
    return;
  }

  const { password, path } = req.body ?? {};
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Senha incorreta" });
    return;
  }

  if (!path || typeof path !== "string") {
    res.status(400).json({ error: "Foto inválida" });
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    res.status(500).json({ error: "Integração com Supabase não configurada no servidor" });
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const { error } = await supabase.storage.from("fotos-festa").remove([path]);
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ ok: true });
}

import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido" });
    return;
  }

  const { password, id } = req.body ?? {};
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Senha incorreta" });
    return;
  }

  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "Convidado inválido" });
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    res.status(500).json({ error: "Integração com Supabase não configurada no servidor" });
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: rsvp, error: fetchError } = await supabase
    .from("rsvps")
    .select("foto_path")
    .eq("id", id)
    .single();

  if (fetchError) {
    res.status(404).json({ error: "Convidado não encontrado" });
    return;
  }

  if (rsvp.foto_path) {
    await supabase.storage.from("fotos-presenca").remove([rsvp.foto_path]);
  }

  const { error: deleteError } = await supabase.from("rsvps").delete().eq("id", id);
  if (deleteError) {
    res.status(500).json({ error: deleteError.message });
    return;
  }

  res.status(200).json({ ok: true });
}

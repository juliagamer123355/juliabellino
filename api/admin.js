import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido" });
    return;
  }

  const { password } = req.body ?? {};
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Senha incorreta" });
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    res.status(500).json({ error: "Integração com Supabase não configurada no servidor" });
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const { data, error } = await supabase
    .from("rsvps")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const withSignedUrls = await Promise.all(
    data.map(async (row) => {
      if (!row.foto_path) return row;
      const { data: signed } = await supabase.storage
        .from("fotos-presenca")
        .createSignedUrl(row.foto_path, 60 * 60);
      return { ...row, foto_url: signed?.signedUrl ?? null };
    }),
  );

  res.status(200).json({ rsvps: withSignedUrls });
}

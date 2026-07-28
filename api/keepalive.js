import { createClient } from "@supabase/supabase-js";

// Chamado uma vez por dia pelo Vercel Cron (ver vercel.json) só para gerar
// atividade no projeto Supabase — no plano gratuito, projetos sem nenhuma
// requisição por 7 dias seguidos são pausados automaticamente.
export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    res.status(500).json({ error: "Integração com Supabase não configurada no servidor" });
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const { error } = await supabase.from("rsvps").select("id", { head: true, count: "exact" });

  if (error) {
    res.status(500).json({ ok: false, error: error.message });
    return;
  }

  res.status(200).json({ ok: true, pingedAt: new Date().toISOString() });
}

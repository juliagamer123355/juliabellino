-- Rode este script UMA VEZ no SQL Editor do Supabase do projeto já em produção.
-- Antes, o formulário de RSVP inseria direto na tabela `rsvps` e no bucket
-- `fotos-presenca` usando a anon key do navegador. Isso funcionava, mas qualquer
-- pessoa que chamasse a API do Supabase diretamente (sem passar pelo site) podia
-- mandar dados fora do formato esperado, ou inundar a tabela com envios em massa
-- (nenhum rate limit existia nesse caminho). Agora o envio passa por /api/rsvp,
-- que valida tudo no servidor e aplica limite de tentativas por IP. Este script
-- fecha o caminho direto, para que só o servidor (chave service_role) consiga
-- inserir.

drop policy if exists "Permitir insercao publica de rsvps" on rsvps;
drop policy if exists "Permitir upload publico em fotos-presenca" on storage.objects;

-- Formato esperado de telefone: "DD 9 DDDD-DDDD" (o mesmo que o front-end já força).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'rsvps_telefone_format') then
    alter table rsvps
      add constraint rsvps_telefone_format
      check (telefone is null or telefone ~ '^[0-9]{2} 9 [0-9]{4}-[0-9]{4}$');
  end if;
end $$;

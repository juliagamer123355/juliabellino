-- Rode este script UMA VEZ no SQL Editor do Supabase do projeto já em produção.
-- Ele corrige uma falha real: o bucket fotos-festa tinha uma política que permitia
-- upload público (to anon, authenticated), ou seja, qualquer pessoa com a anon key
-- do site (visível no bundle JS) conseguia subir arquivos direto pela API do
-- Supabase, pulando completamente a senha do /admin. Agora o upload só acontece
-- pelo servidor (chave service_role), via /api/admin-upload-photo.

drop policy if exists "Permitir upload publico em fotos-festa" on storage.objects;

-- Limites de tamanho e tipo nos buckets — defesa extra caso alguém chame a
-- API do Supabase diretamente (fora do site).
update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
where id in ('fotos-presenca', 'fotos-festa');

-- Limites de tamanho nos campos de texto do RSVP — defesa extra contra
-- alguém enviando dados enormes direto pela API, sem passar pelo formulário.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'rsvps_nome_length') then
    alter table rsvps add constraint rsvps_nome_length check (char_length(nome) <= 200);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'rsvps_observacao_length') then
    alter table rsvps add constraint rsvps_observacao_length check (observacao is null or char_length(observacao) <= 1000);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'rsvps_telefone_length') then
    alter table rsvps add constraint rsvps_telefone_length check (telefone is null or char_length(telefone) <= 20);
  end if;
end $$;

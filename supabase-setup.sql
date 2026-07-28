-- Rode este script no SQL Editor do seu projeto Supabase (Project > SQL Editor > New query).

create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nome text not null,
  telefone text,
  observacao text,
  confirmado text not null check (confirmado in ('sim', 'nao', 'talvez')),
  foto_path text
);

-- Impede duas confirmações de presença com o mesmo telefone.
create unique index if not exists rsvps_telefone_unique
  on rsvps (telefone)
  where telefone is not null and telefone <> '';

alter table rsvps enable row level security;

-- Nenhuma política de insert/select pública aqui de propósito: o envio do
-- formulário de RSVP passa por /api/rsvp (chave service_role, com validação
-- e rate limit no servidor), e a leitura da lista de convidados passa por
-- /api/admin (protegida por senha). O navegador nunca fala direto com esta
-- tabela.

-- Bucket para fotos que os convidados anexam na confirmação (privado).
-- O upload também é feito pelo servidor via /api/rsvp — sem política pública
-- de insert, para não permitir envio direto pela API do Supabase fora do site.
insert into storage.buckets (id, name, public)
values ('fotos-presenca', 'fotos-presenca', false)
on conflict (id) do nothing;

-- Bucket para as fotos da festa (público, liberado pela data no front-end).
-- O upload é feito pelo servidor (chave service_role) via /api/admin-upload-photo,
-- protegida por senha — não existe política pública de insert aqui de propósito,
-- senão qualquer pessoa com a anon key (que fica visível no bundle do site)
-- conseguiria subir arquivos direto pela API do Supabase, pulando a senha do /admin.
insert into storage.buckets (id, name, public)
values ('fotos-festa', 'fotos-festa', true)
on conflict (id) do nothing;

-- Bucket "público" só libera download direto por link; listar os
-- arquivos (usado pela página /fotos e pelo /admin) exige esta política à parte.
create policy "Permitir listar fotos-festa publicamente"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'fotos-festa');

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
  if not exists (select 1 from pg_constraint where conname = 'rsvps_telefone_format') then
    alter table rsvps add constraint rsvps_telefone_format check (telefone is null or telefone ~ '^[0-9]{2} 9 [0-9]{4}-[0-9]{4}$');
  end if;
end $$;

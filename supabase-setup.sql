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

-- Qualquer visitante pode enviar uma confirmação (insert), mas ninguém consegue
-- ler a tabela pelo navegador — só o servidor (chave service_role) lê os dados,
-- na rota /api/admin protegida por senha.
create policy "Permitir insercao publica de rsvps"
  on rsvps for insert
  to public
  with check (true);

-- Bucket para fotos que os convidados anexam na confirmação (privado).
insert into storage.buckets (id, name, public)
values ('fotos-presenca', 'fotos-presenca', false)
on conflict (id) do nothing;

create policy "Permitir upload publico em fotos-presenca"
  on storage.objects for insert
  to public
  with check (bucket_id = 'fotos-presenca');

-- Bucket para as fotos da festa (público, liberado pela data no front-end).
-- O upload é feito pela página /admin (protegida por senha) depois da festa.
insert into storage.buckets (id, name, public)
values ('fotos-festa', 'fotos-festa', true)
on conflict (id) do nothing;

create policy "Permitir upload publico em fotos-festa"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'fotos-festa');

-- Bucket "público" só libera download direto por link; listar os
-- arquivos (usado pela página /fotos) exige esta política à parte.
create policy "Permitir listar fotos-festa publicamente"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'fotos-festa');

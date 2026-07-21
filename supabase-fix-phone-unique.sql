-- Impede duas confirmações de presença com o mesmo telefone.
create unique index if not exists rsvps_telefone_unique
  on rsvps (telefone)
  where telefone is not null and telefone <> '';

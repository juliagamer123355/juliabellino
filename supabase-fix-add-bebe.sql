-- Rode este script no SQL Editor do Supabase para adicionar a pergunta "bebe?" ao RSVP já em produção.

alter table rsvps add column if not exists bebe boolean;

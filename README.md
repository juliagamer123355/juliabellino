# Julia Bellino • Casino Night

Site de convite para o aniversário de 18 anos da Julia — tema Casino Night. React + Vite + Tailwind CSS, com confirmação de presença e galeria de fotos integradas ao Supabase.

## Rotas

- `/` — página inicial (hero, sobre, evento, dress code, save the date)
- `/presenca` — confirmação de presença (com upload de foto opcional)
- `/fotos` — galeria da festa, liberada automaticamente a partir da data configurada em `src/lib/config.js`
- `/admin` — lista de convidados que confirmaram presença (protegida por senha)

## Configuração

1. Copie `.env.example` para `.env.local` e preencha com as credenciais do seu projeto Supabase.
2. No painel do Supabase, abra o **SQL Editor** e rode o conteúdo de `supabase-setup.sql` — isso cria a tabela `rsvps` e os buckets de fotos.
3. Ajuste data, local e demais textos do evento em `src/lib/config.js`.

## Rodando localmente

```bash
npm install
npm run dev
```

A rota `/admin` depende da função serverless em `api/admin.js`, que só funciona rodando via `vercel dev` ou já publicada na Vercel (o `vite dev` puro não executa funções `/api`).

## Deploy

Publicado na Vercel. Variáveis de ambiente necessárias no painel do projeto:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (apenas servidor — nunca exponha no cliente)
- `ADMIN_PASSWORD`

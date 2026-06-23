# Football Stake Tracker

Private FIFA World Cup 2026 stake pool tracker for friends betting together **against external markets** (e.g. Polymarket). Stakes are pooled and PnL is split **proportionally** — not peer vs peer.

## Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS 4, ShadCN UI
- **Backend**: Supabase (Postgres, Auth, RLS)
- **Data**: API-Football
- **AI** (later): OpenRouter / Qwen
- **Deploy**: Vercel + Supabase (free tier)

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env.local
# Fill in Supabase + API keys

# 3. Apply database migration (Supabase dashboard SQL editor or CLI)
# Run: supabase/migrations/20250624000000_initial_schema.sql

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Documentation

| Doc | Description |
|---|---|
| [Architecture](./docs/architecture.md) | System overview, folder structure, phase map |
| [Data model](./docs/data-model.md) | Tables, settlement math, RLS |
| [API contracts](./docs/api-contracts.md) | Route handlers, RPC, external APIs |
| [Auth flow](./docs/auth-flow.md) | Invites, roles, session handling |

## Project structure

```
src/app/              Pages and API routes
src/components/       UI and layout
src/lib/              Supabase, API-Football, settlement, OpenRouter
src/types/            Database and bet rule types
supabase/migrations/  SQL schema
docs/                 System design
```

## Environment variables

See [`.env.example`](./.env.example). Minimum for local dev:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server/cron only)

## Deployment (Vercel)

1. Push repo to GitHub.
2. Import project in Vercel.
3. Add env vars from `.env.example`.
4. Set `CRON_SECRET` for match sync job.
5. Link Supabase project; run migration on production DB.

## Phase status

- [x] **Phase 1** — System design & scaffold
- [ ] Phase 2 — Auth, wallets, ledger, activity
- [ ] Phase 3 — Match sync & browser
- [ ] Phase 4 — Bets & stake pooling
- [ ] Phase 5 — Settlement & host admin
- [ ] Phase 6 — Dashboard polish & deploy

## License

Private — friends group use only.

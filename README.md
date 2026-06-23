# Football Stake Tracker

Private FIFA World Cup 2026 stake pool tracker for friends betting together **against external markets** (e.g. Polymarket). Stakes are pooled and PnL is split **proportionally** — not peer vs peer.

## Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS 4, ShadCN UI
- **Backend**: Supabase (Postgres, Auth, RLS)
- **Data**: TheSportsDB (cached in Supabase)
- **AI** (later): OpenRouter / Qwen
- **Deploy**: Vercel + Supabase (free tier)

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env.local
# Fill in Supabase + TheSportsDB keys

# 3. Apply all database migrations (Supabase dashboard SQL editor or CLI)
# See docs/DEPLOYMENT.md for the full list

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
| [Deployment](./docs/DEPLOYMENT.md) | **Supabase + Vercel setup checklist** |
| [Phase 3 checklist](./docs/phase-3.md) | Auth, dashboard, host tools |
| [Phase 4 checklist](./docs/phase-4.md) | Football data sync & match browser |

## Project structure

```
src/app/              Pages and API routes
src/components/       UI and layout
src/lib/              Supabase, TheSportsDB, settlement, OpenRouter
src/types/            Database and bet rule types
supabase/migrations/  SQL schema
docs/                 System design
```

## Environment variables

See [`.env.example`](./.env.example). Minimum for local dev:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server/cron only)
- `THESPORTSDB_API_KEY` (use `123` for free tier testing)
- `CRON_SECRET`

Platform setup: **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)**

## Phase status

- [x] **Phase 1** — System design & scaffold
- [x] **Phase 2** — Database schema & compatibility views
- [x] **Phase 3** — Authentication & user management
- [x] **Phase 4** — TheSportsDB sync, match browser, cache RLS
- [ ] Phase 5 — Bets & stake pooling
- [ ] Phase 6 — Settlement & host admin polish

## License

Private — friends group use only.

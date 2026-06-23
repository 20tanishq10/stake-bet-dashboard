# Phase 4 Checklist

Phase 4 covers football data integration and the match browser.

## Implemented

- [x] TheSportsDB client (fixtures, results, teams, standings, players, match stats)
- [x] Focus players: Haaland, Salah, Mbappe
- [x] Focus club teams: Arsenal, Liverpool, Barcelona
- [x] Cron route `/api/cron/sync-matches` (every 15 min via `vercel.json`)
- [x] Local cache tables: `teams`, `players`, `match_stats`, `player_stats`, `standings`
- [x] RLS + grants on cache tables for authenticated reads
- [x] Match browser at `/matches` (reads cached `matches` table)
- [x] Signup invite enforcement via database trigger on `auth.users`

## Manual tasks

- [ ] Apply migration `20260624030000_phase4_hardening.sql`
- [ ] Set `THESPORTSDB_*` and `CRON_SECRET` env vars (see [DEPLOYMENT.md](./DEPLOYMENT.md))
- [ ] Run cron once to populate fixtures
- [ ] Verify `/matches` shows data after sync

## Notes

- TheSportsDB free key (`123`) has rate limits; use a paid key for production.
- Match stats sync all finished fixtures (not just a subset).
- Player stats store profile metadata from TheSportsDB; per-match player performance depends on API availability.

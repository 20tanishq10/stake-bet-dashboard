# Phase 3 Checklist

Phase 3 focuses on authentication, host tools, and the user dashboard.

## Implemented

- [x] Email/password login
- [x] Magic link login callback
- [x] Invite validation and consume flow
- [x] Host user creation
- [x] Host wallet adjustments
- [x] Admin user list
- [x] User dashboard wallet summary
- [x] Active bets view
- [x] Recent activity view
- [x] Invite creation API and admin UI

## Manual tasks

- [ ] Apply Supabase migrations in the target project
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Set `CRON_SECRET` and `NEXT_PUBLIC_APP_URL` in Vercel
- [ ] Bootstrap the first host user in Supabase
- [ ] Create the first invite and share it with the group
- [x] Verify `/admin` and `/dashboard` against the live Supabase project
- [ ] Apply migration `20260624030000_phase4_hardening.sql` (invite enforcement + wallet RPC)

## Notes

- Host actions use `SUPABASE_SERVICE_ROLE_KEY` server-side.
- Wallet updates go through the `adjust_wallet` Postgres RPC (atomic balance + ledger + activity).
- Signup requires a valid invite token (enforced in DB trigger on `auth.users`).
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for Supabase and Vercel setup.

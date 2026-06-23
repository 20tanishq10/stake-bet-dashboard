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
- [ ] Verify `/admin` and `/dashboard` against the live Supabase project

## Notes

- Host actions still depend on `SUPABASE_SERVICE_ROLE_KEY` server-side.
- Wallet updates are currently handled through the admin API; RPC functions are still a good future hardening step.
- Invite creation is host-only and uses single-use tokens with expiry.

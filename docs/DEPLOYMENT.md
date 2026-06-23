# Deployment & platform setup

Steps to configure Supabase and Vercel after pulling the latest code.

## 1. Supabase — run migrations

Apply **all** migrations in order via Supabase CLI or SQL editor:

1. `supabase/migrations/20250624000000_initial_schema.sql`
2. `supabase/migrations/20260624010000_phase2_database_setup.sql`
3. `supabase/migrations/20260624020000_phase4_thesportsdb_schema.sql`
4. `supabase/migrations/20260624030000_phase4_hardening.sql`

```bash
# With Supabase CLI linked to your project:
supabase db push
```

### Optional: change default wallet balance

New users receive **1000** virtual currency by default. To change this, run once in the SQL editor:

```sql
ALTER DATABASE postgres SET app.default_wallet_balance = '1500';
```

Then reconnect (or restart) for the setting to apply to new signups.

### Bootstrap the first host

1. Create a user in **Authentication → Users** (or sign up once with a manual host bootstrap).
2. Run `supabase/sql/bootstrap_host.sql` with your email substituted.
3. Sign in and open `/admin`.

### Auth settings (required)

In **Authentication → Providers → Email**:

- Enable email provider.
- **Disable “Allow new users to sign up”** is optional but recommended — invites are enforced in the database trigger, so open signup is already blocked without a valid invite token.

In **Authentication → URL configuration**, add redirect URLs:

- `http://localhost:3000/auth/callback` (local)
- `https://your-app.vercel.app/auth/callback` (production)

### Email confirmation

If **Confirm email** is enabled, signup still works: the invite is consumed when the auth user row is created (not when the session starts). Users confirm email, then log in normally.

---

## 2. Vercel — environment variables

Add these in **Project → Settings → Environment Variables** for Production (and Preview if needed):

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | From Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **Secret** — server/cron only |
| `NEXT_PUBLIC_APP_URL` | Yes | e.g. `https://your-app.vercel.app` |
| `CRON_SECRET` | Yes | Random string; Vercel cron sends `Authorization: Bearer <CRON_SECRET>` |
| `THESPORTSDB_API_KEY` | Yes | Use `123` for dev; paid key for production |
| `THESPORTSDB_LEAGUE_ID` | No | Default `4429` (FIFA World Cup) |
| `THESPORTSDB_SEASON` | No | Default `2026` |
| `OPENROUTER_API_KEY` | Later | Phase 5+ AI features |

**Remove** any unused `API_FOOTBALL_*` variables — this project uses **TheSportsDB** for Phase 4 data sync.

### Cron job

`vercel.json` schedules `/api/cron/sync-matches` every **15 minutes**. On Hobby plan, Vercel cron runs once daily unless you upgrade — check [Vercel cron limits](https://vercel.com/docs/cron-jobs).

After deploy, trigger manually to verify:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/sync-matches
```

Expected response: `{ "synced": { "teams": ..., "fixtures": ..., ... } }`

---

## 3. Post-deploy checklist

- [ ] All four migrations applied
- [ ] Host user bootstrapped (`role = host`)
- [ ] Env vars set on Vercel
- [ ] Auth redirect URLs configured
- [ ] Cron endpoint returns 200 with sync counts
- [ ] `/matches` shows fixtures after first cron run
- [ ] Invite link → signup → dashboard works
- [ ] `/admin` wallet adjustment updates balance + ledger atomically

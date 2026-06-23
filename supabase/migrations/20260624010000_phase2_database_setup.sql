-- Phase 2: Database setup compatibility layer
-- Keeps existing Phase 1 schema intact while exposing Phase 2 table contracts.

-- -----------------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------------
-- Expose product-level `users` shape from profiles + auth.users.
create or replace view public.users as
select
  p.id,
  p.display_name as name,
  au.email,
  p.wallet_balance,
  p.created_at
from public.profiles p
left join auth.users au on au.id = p.id;

-- -----------------------------------------------------------------------------
-- matches
-- -----------------------------------------------------------------------------
-- Add Phase 2 alias columns to existing matches table.
alter table public.matches
  add column if not exists fixture_id bigint generated always as (id) stored,
  add column if not exists home_team text generated always as (home_team_name) stored,
  add column if not exists away_team text generated always as (away_team_name) stored,
  add column if not exists kickoff_time timestamptz generated always as (kickoff_at) stored;

-- -----------------------------------------------------------------------------
-- bets
-- -----------------------------------------------------------------------------
-- Add Phase 2 contract columns to existing bets table.
-- `result` maps to `net_result`.
-- `stake` and `payout_multiplier` are kept as explicit nullable columns for Phase 2 APIs.
alter table public.bets
  add column if not exists stake numeric(12, 2),
  add column if not exists payout_multiplier numeric(8, 4),
  add column if not exists result numeric(12, 2) generated always as (net_result) stored;

-- -----------------------------------------------------------------------------
-- bet_participants
-- -----------------------------------------------------------------------------
-- Expose Phase 2 naming over existing bet_participations.
create or replace view public.bet_participants as
select
  bp.id,
  bp.bet_id,
  bp.user_id,
  bp.share_pct as share_percentage,
  bp.stake_amount as contribution
from public.bet_participations bp;

-- -----------------------------------------------------------------------------
-- transactions
-- -----------------------------------------------------------------------------
-- Expose wallet ledger as product-level transactions table.
create or replace view public.transactions as
select
  wl.id,
  wl.user_id,
  wl.amount,
  wl.entry_type::text as type,
  wl.created_at
from public.wallet_ledger wl;

-- -----------------------------------------------------------------------------
-- activity_logs
-- -----------------------------------------------------------------------------
-- Add Phase 2 alias columns while preserving existing event model.
alter table public.activity_logs
  add column if not exists action text generated always as (event_type::text) stored,
  add column if not exists user_id uuid generated always as (actor_id) stored;

-- -----------------------------------------------------------------------------
-- Grants for authenticated app access
-- -----------------------------------------------------------------------------
grant select on public.users to authenticated;
grant select on public.bet_participants to authenticated;
grant select on public.transactions to authenticated;

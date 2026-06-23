-- Football Stake Tracker — initial schema (Phase 1)
-- Run via Supabase CLI or SQL editor after project creation.

-- ─── Extensions ───────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── Enums ────────────────────────────────────────────────────
create type public.user_role as enum ('host', 'participant');
create type public.bet_status as enum (
  'draft',
  'open',
  'locked',
  'pending_settlement',
  'settled',
  'void'
);
create type public.ledger_entry_type as enum (
  'initial_balance',
  'host_credit',
  'host_debit',
  'stake_lock',
  'stake_release',
  'settlement_payout',
  'settlement_loss',
  'void_refund'
);
create type public.activity_event_type as enum (
  'user_joined',
  'invite_created',
  'wallet_adjusted',
  'bet_created',
  'bet_joined',
  'bet_locked',
  'bet_settled',
  'bet_voided'
);

-- ─── Profiles (extends auth.users) ────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  role public.user_role not null default 'participant',
  wallet_balance numeric(12, 2) not null default 0 check (wallet_balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Invites ──────────────────────────────────────────────────
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  email text,
  created_by uuid not null references public.profiles (id),
  used_by uuid references public.profiles (id),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index invites_token_idx on public.invites (token);

-- ─── Cached WC matches (API-Football) ─────────────────────────
create table public.matches (
  id bigint primary key,
  league_id int not null,
  season int not null,
  round text,
  home_team_id int not null,
  home_team_name text not null,
  away_team_id int not null,
  away_team_name text not null,
  kickoff_at timestamptz not null,
  status text not null,
  home_goals int,
  away_goals int,
  raw_payload jsonb not null default '{}',
  synced_at timestamptz not null default now()
);

create index matches_kickoff_idx on public.matches (kickoff_at);
create index matches_status_idx on public.matches (status);

-- ─── Bets ─────────────────────────────────────────────────────
create table public.bets (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles (id),
  match_id bigint references public.matches (id),
  title text not null,
  description text,
  market_reference text,
  rule jsonb not null,
  status public.bet_status not null default 'draft',
  lock_at timestamptz,
  net_result numeric(12, 2),
  settled_at timestamptz,
  settled_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bets_status_idx on public.bets (status);
create index bets_match_idx on public.bets (match_id);

-- ─── Bet participations ───────────────────────────────────────
create table public.bet_participations (
  id uuid primary key default gen_random_uuid(),
  bet_id uuid not null references public.bets (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  stake_amount numeric(12, 2) not null check (stake_amount > 0),
  share_pct numeric(8, 6) not null check (share_pct > 0 and share_pct <= 1),
  payout_amount numeric(12, 2),
  joined_at timestamptz not null default now(),
  unique (bet_id, user_id)
);

create index participations_bet_idx on public.bet_participations (bet_id);
create index participations_user_idx on public.bet_participations (user_id);

-- ─── Wallet ledger (immutable) ────────────────────────────────
create table public.wallet_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id),
  entry_type public.ledger_entry_type not null,
  amount numeric(12, 2) not null,
  balance_after numeric(12, 2) not null,
  bet_id uuid references public.bets (id),
  note text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index wallet_ledger_user_idx on public.wallet_ledger (user_id, created_at desc);
create index wallet_ledger_bet_idx on public.wallet_ledger (bet_id);

-- ─── Activity logs ────────────────────────────────────────────
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  event_type public.activity_event_type not null,
  actor_id uuid references public.profiles (id),
  target_user_id uuid references public.profiles (id),
  bet_id uuid references public.bets (id),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index activity_logs_created_idx on public.activity_logs (created_at desc);

-- ─── Updated_at trigger ───────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger bets_updated_at
  before update on public.bets
  for each row execute function public.set_updated_at();

-- ─── Profile bootstrap on signup ──────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_balance numeric := coalesce(
    (current_setting('app.default_wallet_balance', true))::numeric,
    1000
  );
begin
  insert into public.profiles (id, display_name, role, wallet_balance)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'participant'),
    default_balance
  );

  insert into public.wallet_ledger (
    user_id, entry_type, amount, balance_after, note
  ) values (
    new.id, 'initial_balance', default_balance, default_balance, 'Account created'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Row Level Security ───────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.invites enable row level security;
alter table public.matches enable row level security;
alter table public.bets enable row level security;
alter table public.bet_participations enable row level security;
alter table public.wallet_ledger enable row level security;
alter table public.activity_logs enable row level security;

-- Helper: is current user host
create or replace function public.is_host()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'host'
  );
$$;

-- Profiles: read all authenticated; update own; host can update others
create policy "profiles_select_authenticated"
  on public.profiles for select to authenticated using (true);

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_host_update"
  on public.profiles for update to authenticated
  using (public.is_host());

-- Invites: host manages; anyone can read valid token via service role signup flow
create policy "invites_host_all"
  on public.invites for all to authenticated
  using (public.is_host())
  with check (public.is_host());

-- Matches: read-only for authenticated users
create policy "matches_select_authenticated"
  on public.matches for select to authenticated using (true);

-- Bets: all authenticated can read; host creates; participants join via RPC later
create policy "bets_select_authenticated"
  on public.bets for select to authenticated using (true);

create policy "bets_insert_host"
  on public.bets for insert to authenticated
  with check (public.is_host() and created_by = auth.uid());

create policy "bets_update_host"
  on public.bets for update to authenticated
  using (public.is_host());

-- Participations: users read all; insert own when bet open (enforced in RPC)
create policy "participations_select_authenticated"
  on public.bet_participations for select to authenticated using (true);

create policy "participations_insert_own"
  on public.bet_participations for insert to authenticated
  with check (user_id = auth.uid());

-- Ledger: users read own; host reads all; writes via service functions only
create policy "ledger_select_own"
  on public.wallet_ledger for select to authenticated
  using (user_id = auth.uid() or public.is_host());

-- Activity: all authenticated read
create policy "activity_select_authenticated"
  on public.activity_logs for select to authenticated using (true);

create policy "activity_insert_authenticated"
  on public.activity_logs for insert to authenticated
  with check (actor_id = auth.uid() or public.is_host());

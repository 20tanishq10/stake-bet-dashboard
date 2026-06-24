-- Phase 4: Hybrid API Architecture Setup

-- 1. Drop old Phase 4 TheSportsDB tables if they exist
drop table if exists public.standings cascade;
drop table if exists public.player_stats cascade;
drop table if exists public.match_stats cascade;
drop table if exists public.players cascade;
drop table if exists public.teams cascade;

-- 2. Drop the existing foreign key constraint from bets to matches
alter table public.bets drop constraint if exists bets_match_id_fkey;

-- 3. Drop the old matches table
drop table if exists public.matches cascade;

-- 4. Alter the bets match_id column to text
alter table public.bets alter column match_id type text using match_id::text;

-- 5. Create the new matches table
create table public.matches (
  id text primary key,
  home_team text not null,
  away_team text not null,
  match_time timestamptz not null,
  stage text not null,
  home_score integer,
  away_score integer,
  status text not null,
  api_football_id text,
  api_football_data jsonb,
  updated_at timestamptz not null default now()
);

-- Indexes for performance
create index matches_status_idx on public.matches (status);
create index matches_time_idx on public.matches (match_time);

-- 6. Add the foreign key constraint back to bets
alter table public.bets
  add constraint bets_match_id_fkey
  foreign key (match_id) references public.matches (id)
  on delete set null;

-- 7. Create the api_rate_limits table
create table public.api_rate_limits (
  date date primary key default current_date,
  request_count integer not null default 0
);

-- 8. Add updated_at trigger for matches
create trigger matches_updated_at
  before update on public.matches
  for each row execute function public.set_updated_at();

-- 9. Row Level Security for new tables
alter table public.matches enable row level security;
alter table public.api_rate_limits enable row level security;

-- Matches: read-only for authenticated users
create policy "matches_select_authenticated"
  on public.matches for select to authenticated using (true);

-- API Rate Limits: read/write by service role only (no public access)
-- (Supabase service_role key bypasses RLS, so we don't need policies if we only access it from the server)

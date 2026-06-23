-- Phase 4: TheSportsDB local cache tables
-- Stores all fetched payloads in Supabase for match browsing and stats.

create table if not exists public.teams (
  id bigint primary key,
  league_id bigint not null default 4429,
  season text not null default '2026',
  name text not null,
  short_name text,
  badge_url text,
  flag_url text,
  country text,
  stadium text,
  formed_year int,
  raw_payload jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default now()
);

create index if not exists teams_league_season_idx on public.teams (league_id, season);
create index if not exists teams_name_idx on public.teams (name);

create table if not exists public.players (
  id bigint primary key,
  team_id bigint references public.teams (id) on delete set null,
  league_id bigint not null default 4429,
  season text not null default '2026',
  name text not null,
  firstname text,
  lastname text,
  nationality text,
  birth_date date,
  position text,
  photo_url text,
  raw_payload jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default now()
);

create index if not exists players_team_idx on public.players (team_id);
create index if not exists players_name_idx on public.players (name);

create table if not exists public.match_stats (
  id uuid primary key default gen_random_uuid(),
  match_id bigint not null references public.matches (id) on delete cascade,
  league_id bigint not null default 4429,
  season text not null default '2026',
  stat_type text not null,
  stat_value text,
  raw_payload jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default now(),
  unique (match_id, stat_type)
);

create index if not exists match_stats_match_idx on public.match_stats (match_id);

create table if not exists public.player_stats (
  id uuid primary key default gen_random_uuid(),
  match_id bigint references public.matches (id) on delete cascade,
  player_id bigint not null references public.players (id) on delete cascade,
  league_id bigint not null default 4429,
  season text not null default '2026',
  stat_type text not null,
  stat_value text,
  raw_payload jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default now(),
  unique (player_id, stat_type, season)
);

create index if not exists player_stats_match_idx on public.player_stats (match_id);
create index if not exists player_stats_player_idx on public.player_stats (player_id);

create table if not exists public.standings (
  id uuid primary key default gen_random_uuid(),
  league_id bigint not null default 4429,
  season text not null default '2026',
  team_id bigint references public.teams (id) on delete set null,
  rank int,
  group_name text,
  played int,
  wins int,
  draws int,
  losses int,
  goals_for int,
  goals_against int,
  goal_difference int,
  points int,
  raw_payload jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default now(),
  unique (league_id, season, team_id, group_name)
);

create index if not exists standings_league_season_idx on public.standings (league_id, season);
create index if not exists standings_team_idx on public.standings (team_id);

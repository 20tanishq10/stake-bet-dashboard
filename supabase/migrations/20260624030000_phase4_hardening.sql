-- Phase 4 hardening: RLS for cache tables, atomic wallet RPC, signup invite enforcement

-- ─── Phase 4 cache tables: RLS + grants ───────────────────────
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.match_stats enable row level security;
alter table public.player_stats enable row level security;
alter table public.standings enable row level security;

create policy "teams_select_authenticated"
  on public.teams for select to authenticated using (true);

create policy "players_select_authenticated"
  on public.players for select to authenticated using (true);

create policy "match_stats_select_authenticated"
  on public.match_stats for select to authenticated using (true);

create policy "player_stats_select_authenticated"
  on public.player_stats for select to authenticated using (true);

create policy "standings_select_authenticated"
  on public.standings for select to authenticated using (true);

grant select on public.teams to authenticated;
grant select on public.players to authenticated;
grant select on public.match_stats to authenticated;
grant select on public.player_stats to authenticated;
grant select on public.standings to authenticated;

-- ─── Tighten profiles RLS (wallet changes via RPC / service role only) ─
drop policy if exists "profiles_host_update" on public.profiles;

-- ─── Activity logs: host-only inserts from client ─────────────
drop policy if exists "activity_insert_authenticated" on public.activity_logs;

create policy "activity_insert_host"
  on public.activity_logs for insert to authenticated
  with check (public.is_host() and actor_id = auth.uid());

-- ─── Signup invite validation (blocks open registration) ───────
create or replace function public.validate_auth_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_token text;
  invite_row public.invites%rowtype;
begin
  if coalesce(new.raw_user_meta_data ->> 'created_by_admin', 'false') = 'true' then
    return new;
  end if;

  if coalesce(new.raw_user_meta_data ->> 'role', '') = 'host' then
    return new;
  end if;

  invite_token := new.raw_user_meta_data ->> 'invite_token';
  if invite_token is null or invite_token = '' then
    raise exception 'Valid invite required to sign up';
  end if;

  select * into invite_row
  from public.invites
  where token = invite_token
  for update;

  if not found then
    raise exception 'Invalid invite token';
  end if;

  if invite_row.used_by is not null then
    raise exception 'Invite already used';
  end if;

  if invite_row.expires_at <= now() then
    raise exception 'Invite expired';
  end if;

  if invite_row.email is not null and lower(invite_row.email) <> lower(new.email) then
    raise exception 'Email does not match invite';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_auth_signup_before_insert on auth.users;

create trigger validate_auth_signup_before_insert
  before insert on auth.users
  for each row execute function public.validate_auth_signup();

-- ─── Profile bootstrap: mark invite used on signup ─────────────
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
  invite_token text;
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

  invite_token := new.raw_user_meta_data ->> 'invite_token';
  if invite_token is not null
    and coalesce(new.raw_user_meta_data ->> 'created_by_admin', 'false') <> 'true' then
    update public.invites
    set used_by = new.id, used_at = now()
    where token = invite_token and used_by is null;

    insert into public.activity_logs (event_type, actor_id, metadata)
    values (
      'user_joined',
      new.id,
      jsonb_build_object('invite_token', invite_token)
    );
  end if;

  return new;
end;
$$;

-- ─── Atomic host wallet adjustment ─────────────────────────────
create or replace function public.adjust_wallet(
  p_user_id uuid,
  p_amount numeric,
  p_note text default null,
  p_actor_id uuid default null
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  current_balance numeric;
  next_balance numeric;
  entry_type public.ledger_entry_type;
  actor uuid;
begin
  actor := coalesce(p_actor_id, auth.uid());

  if actor is null then
    raise exception 'Actor required';
  end if;

  if not exists (
    select 1 from public.profiles where id = actor and role = 'host'
  ) then
    raise exception 'Forbidden';
  end if;

  select wallet_balance into current_balance
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    raise exception 'User not found';
  end if;

  next_balance := current_balance + p_amount;
  if next_balance < 0 then
    raise exception 'Wallet balance cannot go below zero';
  end if;

  entry_type := case
    when p_amount >= 0 then 'host_credit'::public.ledger_entry_type
    else 'host_debit'::public.ledger_entry_type
  end;

  update public.profiles
  set wallet_balance = next_balance
  where id = p_user_id;

  insert into public.wallet_ledger (
    user_id, entry_type, amount, balance_after, note, created_by
  ) values (
    p_user_id, entry_type, p_amount, next_balance, p_note, actor
  );

  insert into public.activity_logs (
    event_type, actor_id, target_user_id, metadata
  ) values (
    'wallet_adjusted',
    actor,
    p_user_id,
    jsonb_build_object(
      'amount', p_amount,
      'note', p_note,
      'balance_after', next_balance
    )
  );

  return next_balance;
end;
$$;

grant execute on function public.adjust_wallet(uuid, numeric, text, uuid) to authenticated;
grant execute on function public.adjust_wallet(uuid, numeric, text, uuid) to service_role;

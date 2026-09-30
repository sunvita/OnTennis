-- Tennis draw builder: shared storage for players, match history and settings.
-- Run once in the Supabase SQL editor of the new project.

create table if not exists public.tennis_players (
  id bigint primary key,
  ko text not null,
  en text not null,
  level numeric not null default 0,
  start_min int not null default 300,
  custom boolean not null default false,
  sel boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.tennis_matches (
  id bigint generated always as identity primary key,
  sid text not null,
  played_on date not null,
  r int not null default 0,
  c int not null default 0,
  type text not null default 'doubles',
  a bigint[] not null,
  b bigint[] not null,
  sa int not null,
  sb int not null,
  created_at timestamptz not null default now()
);
create index if not exists tennis_matches_sid_idx on public.tennis_matches (sid);
create index if not exists tennis_matches_date_idx on public.tennis_matches (played_on);

create table if not exists public.tennis_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.tennis_players  enable row level security;
alter table public.tennis_matches  enable row level security;
alter table public.tennis_settings enable row level security;

-- TEST ONLY: anyone who has the app link (anon key) can read and write.
-- Before real use, replace these with policies that require a signed-in operator
-- (for example: to authenticated using (true) with check (true)) and add Supabase Auth login.
create policy "test open access" on public.tennis_players  for all to anon, authenticated using (true) with check (true);
create policy "test open access" on public.tennis_matches  for all to anon, authenticated using (true) with check (true);
create policy "test open access" on public.tennis_settings for all to anon, authenticated using (true) with check (true);

-- Level change history and saved draws
create table if not exists public.tennis_level_changes (
  id bigint generated always as identity primary key,
  player_id bigint not null,
  player_ko text not null,
  player_en text not null,
  old_level numeric not null,
  new_level numeric not null,
  source text not null default 'manual',
  basis jsonb,
  changed_by text,
  changed_on date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists tennis_level_changes_player_idx on public.tennis_level_changes (player_id, created_at desc);

create table if not exists public.tennis_draws (
  sid text primary key,
  played_on date not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists tennis_draws_date_idx on public.tennis_draws (played_on desc);

alter table public.tennis_level_changes enable row level security;
alter table public.tennis_draws enable row level security;
create policy "test open access" on public.tennis_level_changes for all to anon, authenticated using (true) with check (true);
create policy "test open access" on public.tennis_draws for all to anon, authenticated using (true) with check (true);

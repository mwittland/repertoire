create extension if not exists "pgcrypto";

create type public.gender as enum ('Male', 'Female');
create type public.shot_request_status as enum ('pending', 'approved', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  gender public.gender,
  is_admin boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.shots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  court_x_min numeric not null check (court_x_min between -15 and 15),
  court_x_max numeric not null check (court_x_max between -15 and 15),
  court_y_min numeric not null check (court_y_min between 0 and 30),
  court_y_max numeric not null check (court_y_max between 0 and 30),
  ball_height_min numeric not null check (ball_height_min between 0 and 10),
  ball_height_max numeric not null check (ball_height_max between 0 and 10),
  intent_min numeric not null check (intent_min between 0 and 100),
  intent_max numeric not null check (intent_max between 0 and 100),
  video_url text,
  description text not null default '',
  difficulty smallint not null check (difficulty between 0 and 5),
  instructions text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint shots_court_x_order check (court_x_min <= court_x_max),
  constraint shots_court_y_order check (court_y_min <= court_y_max),
  constraint shots_ball_height_order check (ball_height_min <= ball_height_max),
  constraint shots_intent_order check (intent_min <= intent_max)
);

create table public.drills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  video_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.shot_drills (
  shot_id uuid not null references public.shots(id) on delete cascade,
  drill_id uuid not null references public.drills(id) on delete cascade,
  primary key (shot_id, drill_id)
);

create table public.repertoire_entries (
  user_id uuid not null references public.profiles(id) on delete cascade,
  shot_id uuid not null references public.shots(id) on delete cascade,
  confidence smallint not null default 0 check (confidence between 0 and 5),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, shot_id)
);

create table public.shot_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  requested_name text not null,
  video_url text not null,
  status public.shot_request_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index shots_discovery_ranges_idx on public.shots (court_x_min, court_x_max, court_y_min, court_y_max);
create index shot_drills_drill_id_idx on public.shot_drills (drill_id);
create index shot_requests_status_idx on public.shot_requests (status);

alter table public.profiles enable row level security;
alter table public.shots enable row level security;
alter table public.drills enable row level security;
alter table public.shot_drills enable row level security;
alter table public.repertoire_entries enable row level security;
alter table public.shot_requests enable row level security;

create policy "Published shots are readable" on public.shots for select using (true);
create policy "Published drills are readable" on public.drills for select using (true);
create policy "Shot drill links are readable" on public.shot_drills for select using (true);
create policy "Users read their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users manage their repertoire" on public.repertoire_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users create their shot requests" on public.shot_requests for insert with check (auth.uid() = user_id);
create policy "Users read their shot requests" on public.shot_requests for select using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
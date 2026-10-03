alter table public.drills
  add column court_x_min numeric not null default -15 check (court_x_min between -15 and 15),
  add column court_x_max numeric not null default 15 check (court_x_max between -15 and 15),
  add column court_y_min numeric not null default 0 check (court_y_min between 0 and 30),
  add column court_y_max numeric not null default 30 check (court_y_max between 0 and 30),
  add column court_x_left_min numeric not null default -15 check (court_x_left_min between -15 and 15),
  add column court_x_left_max numeric not null default 15 check (court_x_left_max between -15 and 15);

create table public.drill_routine_entries (
  user_id uuid not null references public.profiles(id) on delete cascade,
  drill_id uuid not null references public.drills(id) on delete cascade,
  mastery smallint not null default 0 check (mastery between 0 and 100),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, drill_id)
);

create index drill_routine_entries_drill_id_idx
  on public.drill_routine_entries (drill_id);

alter table public.drill_routine_entries enable row level security;

create policy "Users manage their drill routine"
  on public.drill_routine_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into public.drills
  (name, description, court_x_min, court_x_max, court_y_min, court_y_max)
values
  ('Crosscourt Dink Ladder', 'Build a patient crosscourt exchange by landing ten dinks in a row before switching sides.', -12, -2, 0, 12),
  ('Transition Reset Circuit', 'Start from transition court and soften five balls into the kitchen before recovering to the line.', -8, 8, 10, 24),
  ('Middle Attack Decision', 'Feed attackable balls through the middle and practice choosing the safest finishing target.', -5, 5, 12, 30)
on conflict do nothing;

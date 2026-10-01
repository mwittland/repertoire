alter table public.shots
  add column court_x_left_min numeric,
  add column court_x_left_max numeric;

update public.shots
set
  court_x_left_min = -court_x_max,
  court_x_left_max = -court_x_min;

alter table public.shots
  alter column court_x_left_min set not null,
  alter column court_x_left_max set not null,
  add constraint shots_left_court_x_min_bounds check (court_x_left_min between -15 and 15),
  add constraint shots_left_court_x_max_bounds check (court_x_left_max between -15 and 15),
  add constraint shots_left_court_x_order check (court_x_left_min <= court_x_left_max);

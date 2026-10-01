-- Development/demo catalog: 50 shots, 50 drills, and relational associations.
-- Names are intentionally prefixed so this dataset can coexist with editorial content.

insert into public.shots (
  name,
  court_x_min,
  court_x_max,
  court_y_min,
  court_y_max,
  ball_height_min,
  ball_height_max,
  intent_min,
  intent_max,
  difficulty,
  description,
  instructions
)
select
  format('Dummy Shot %s', lpad(number::text, 2, '0')),
  -15 + ((number - 1) % 6) * 5,
  -10 + ((number - 1) % 6) * 5,
  ((number - 1) % 6) * 5,
  5 + ((number - 1) % 6) * 5,
  (number - 1) % 6,
  5 + ((number - 1) % 6),
  ((number - 1) % 6) * 15,
  25 + ((number - 1) % 6) * 15,
  (number - 1) % 6,
  format('Dummy training shot %s for testing discovery, catalog filtering, and admin workflows.', number),
  format('Use controlled contact and finish toward the intended target. Dummy variation %s.', number)
from generate_series(1, 50) as series(number);

insert into public.drills (name, description)
select
  format('Dummy Drill %s', lpad(number::text, 2, '0')),
  format('Dummy practice drill %s for testing drill catalogs, detail pages, and shot relationships.', number)
from generate_series(1, 50) as series(number);

insert into public.shot_drills (shot_id, drill_id)
select shots.id, drills.id
from generate_series(1, 50) as series(number)
join public.shots on shots.name = format('Dummy Shot %s', lpad(number::text, 2, '0'))
join public.drills on drills.name = format('Dummy Drill %s', lpad((((number - 1) % 50 + 1)::text), 2, '0'))
union
select shots.id, drills.id
from generate_series(1, 50) as series(number)
join public.shots on shots.name = format('Dummy Shot %s', lpad(number::text, 2, '0'))
join public.drills on drills.name = format('Dummy Drill %s', lpad((((number + 11) % 50 + 1)::text), 2, '0'))
where number % 2 = 0
on conflict do nothing;

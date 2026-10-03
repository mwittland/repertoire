alter table public.drills
  add column ball_height_min numeric not null default 0 check (ball_height_min between 0 and 10),
  add column ball_height_max numeric not null default 10 check (ball_height_max between 0 and 10),
  add constraint drills_ball_height_order check (ball_height_min <= ball_height_max);

update public.drills
set ball_height_min = case name
  when 'Crosscourt Dink Ladder' then 1
  when 'Transition Reset Circuit' then 3
  when 'Middle Attack Decision' then 5
  else 0
end,
ball_height_max = case name
  when 'Crosscourt Dink Ladder' then 4
  when 'Transition Reset Circuit' then 7
  when 'Middle Attack Decision' then 10
  else 10
end;

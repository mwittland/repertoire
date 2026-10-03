alter table public.drills
  add column type text not null default 'Solo'
  check (type in ('Solo', 'Wall', 'Ball Machine', 'Partner+'));

update public.drills
set type = case name
  when 'Crosscourt Dink Ladder' then 'Solo'
  when 'Transition Reset Circuit' then 'Partner+'
  when 'Middle Attack Decision' then 'Ball Machine'
  else 'Solo'
end;

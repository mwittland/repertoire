create type public.shot_type as enum ('Dink', 'Drop', 'Drive', 'Reset', 'Attack', 'Putaway', 'Lob');

alter table public.shots
  add column shot_type public.shot_type not null default 'Reset',
  add column aggression_score smallint not null default 50 check (aggression_score between 0 and 100);

alter table public.shots drop constraint shots_intent_order;
alter table public.shots drop constraint shots_intent_min_check;
alter table public.shots drop constraint shots_intent_max_check;
alter table public.shots drop column intent_min;
alter table public.shots drop column intent_max;

alter table public.shots drop constraint shots_difficulty_check;
update public.shots set difficulty = least(difficulty * 20, 100);
alter table public.shots add constraint shots_difficulty_score_check check (difficulty between 0 and 100);

update public.shots
set shot_type = case
  when lower(name) like '%dink%' then 'Dink'::public.shot_type
  when lower(name) like '%drop%' then 'Drop'::public.shot_type
  when lower(name) like '%drive%' or lower(name) like '%serve%' or lower(name) like '%return%' then 'Drive'::public.shot_type
  when lower(name) like '%reset%' or lower(name) like '%block%' then 'Reset'::public.shot_type
  when lower(name) like '%lob%' then 'Lob'::public.shot_type
  when lower(name) like '%overhead%' or lower(name) like '%speed%' or lower(name) like '%volley%' or lower(name) like '%poach%' then 'Attack'::public.shot_type
  when lower(name) like '%erne%' or lower(name) like '%atp%' or lower(name) like '%bert%' or lower(name) like '%finish%' then 'Putaway'::public.shot_type
  else 'Reset'::public.shot_type
end;

update public.shots
set aggression_score = case shot_type
  when 'Dink' then 30
  when 'Drop' then 40
  when 'Reset' then 25
  when 'Lob' then 45
  when 'Drive' then 70
  when 'Attack' then 85
  when 'Putaway' then 100
end;

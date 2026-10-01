create type public.handedness as enum ('Right', 'Left');

alter table public.profiles add column handedness public.handedness;
update public.profiles set handedness = 'Right' where handedness is null;
alter table public.profiles alter column handedness set default 'Right';
alter table public.profiles alter column handedness set not null;
alter table public.profiles drop column gender;
drop type public.gender;

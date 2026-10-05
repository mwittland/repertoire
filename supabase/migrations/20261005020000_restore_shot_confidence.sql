alter table public.repertoire_entries
  add column if not exists confidence smallint not null default 0
  check (confidence between 0 and 100);

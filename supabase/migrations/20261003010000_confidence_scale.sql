alter table public.repertoire_entries
  alter column confidence drop default,
  alter column confidence drop not null;

update public.repertoire_entries
set confidence = null
where confidence = 0;

update public.repertoire_entries
set confidence = confidence * 20
where confidence is not null;

alter table public.repertoire_entries
  drop constraint if exists repertoire_entries_confidence_check,
  add constraint repertoire_entries_confidence_check
    check (confidence is null or confidence between 0 and 100);

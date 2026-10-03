-- Destructive catalog reset for the manually curated shot/drill catalog.
-- Preserves users, profiles, auth, and shot/drill requests.

delete from public.shot_drills;
delete from public.repertoire_entries;
delete from public.shots;
delete from public.drills;

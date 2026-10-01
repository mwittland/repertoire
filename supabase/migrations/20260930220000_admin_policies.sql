create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
$$;

create policy "Admins manage shots" on public.shots for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage drills" on public.drills for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage shot drill links" on public.shot_drills for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins review shot requests" on public.shot_requests for select using (public.is_admin());
create policy "Admins update shot requests" on public.shot_requests for update using (public.is_admin()) with check (public.is_admin());
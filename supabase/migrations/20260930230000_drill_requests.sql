create table public.drill_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  requested_name text not null,
  video_url text not null,
  status public.shot_request_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index drill_requests_status_idx on public.drill_requests (status);

alter table public.drill_requests enable row level security;

create policy "Users create their own drill requests" on public.drill_requests for insert with check (auth.uid() = user_id);
create policy "Users read their own drill requests" on public.drill_requests for select using (auth.uid() = user_id);
create policy "Admins review drill requests" on public.drill_requests for select using (public.is_admin());
create policy "Admins update drill requests" on public.drill_requests for update using (public.is_admin()) with check (public.is_admin());
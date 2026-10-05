delete from public.site_metrics where metric = 'registered_users';

alter table public.site_metrics
  drop constraint if exists site_metrics_metric_check;

alter table public.site_metrics
  add constraint site_metrics_metric_check
  check (metric in ('quiz_completions', 'discovery_searches'));

alter table public.shots
  add column if not exists video_start_seconds integer,
  add column if not exists video_end_seconds integer;

alter table public.drills
  add column if not exists video_start_seconds integer,
  add column if not exists video_end_seconds integer;

create table public.shot_video_requests (
  id uuid primary key default gen_random_uuid(),
  shot_id uuid not null references public.shots(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  video_url text not null,
  start_seconds integer not null check (start_seconds >= 0),
  end_seconds integer not null check (end_seconds > start_seconds),
  status public.shot_request_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index shot_video_requests_status_idx
  on public.shot_video_requests (status);

alter table public.shot_video_requests enable row level security;

create policy "Users create shot video requests"
  on public.shot_video_requests for insert
  with check (auth.uid() = user_id);

create policy "Users read their shot video requests"
  on public.shot_video_requests for select
  using (auth.uid() = user_id);

create policy "Admins review shot video requests"
  on public.shot_video_requests for all
  using (public.is_admin())
  with check (public.is_admin());

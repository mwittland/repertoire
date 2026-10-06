create extension if not exists "pgcrypto";

create table public.shared_repertoires (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  share_token text not null unique,
  profile_name text not null,
  handedness text not null check (handedness in ('Right', 'Left')),
  shots jsonb not null check (jsonb_typeof(shots) = 'array'),
  created_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null default timezone('utc', now()) + interval '30 days'
);

create index shared_repertoires_token_idx
  on public.shared_repertoires (share_token);
create index shared_repertoires_user_id_idx
  on public.shared_repertoires (user_id);

alter table public.shared_repertoires enable row level security;

create policy "Active shared repertoires are publicly readable"
  on public.shared_repertoires
  for select
  using (expires_at > timezone('utc', now()));

create policy "Users create their own shared repertoires"
  on public.shared_repertoires
  for insert
  with check (auth.uid() = user_id);

create policy "Users manage their own shared repertoires"
  on public.shared_repertoires
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete their own shared repertoires"
  on public.shared_repertoires
  for delete
  using (auth.uid() = user_id);

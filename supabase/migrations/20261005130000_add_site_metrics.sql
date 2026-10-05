create table public.site_metrics (
  metric text primary key check (metric in ('quiz_completions', 'discovery_searches')),
  total bigint not null default 0 check (total >= 0)
);

insert into public.site_metrics (metric)
values ('quiz_completions'), ('discovery_searches');

alter table public.site_metrics enable row level security;

create policy "Public site metrics are readable"
  on public.site_metrics for select
  using (true);

create or replace function public.increment_site_metric(metric_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.site_metrics
  set total = total + 1
  where metric = metric_name;

  if not found then
    raise exception 'Unknown site metric: %', metric_name;
  end if;
end;
$$;

revoke all on function public.increment_site_metric(text) from public;
grant execute on function public.increment_site_metric(text) to anon, authenticated;

create table if not exists public.maintenance_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  last_completed_date date not null,
  recurrence_interval_days integer not null check (recurrence_interval_days > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists maintenance_tasks_user_id_idx
  on public.maintenance_tasks(user_id);

create index if not exists maintenance_tasks_user_last_completed_date_idx
  on public.maintenance_tasks(user_id, last_completed_date);

create or replace function public.set_maintenance_tasks_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists maintenance_tasks_set_updated_at on public.maintenance_tasks;

create trigger maintenance_tasks_set_updated_at
  before update on public.maintenance_tasks
  for each row
  execute function public.set_maintenance_tasks_updated_at();

alter table public.maintenance_tasks enable row level security;

drop policy if exists "maintenance_tasks_select_own" on public.maintenance_tasks;

create policy "maintenance_tasks_select_own"
  on public.maintenance_tasks
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "maintenance_tasks_insert_own" on public.maintenance_tasks;

create policy "maintenance_tasks_insert_own"
  on public.maintenance_tasks
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "maintenance_tasks_update_own" on public.maintenance_tasks;

create policy "maintenance_tasks_update_own"
  on public.maintenance_tasks
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "maintenance_tasks_delete_own" on public.maintenance_tasks;

create policy "maintenance_tasks_delete_own"
  on public.maintenance_tasks
  for delete
  to authenticated
  using (user_id = auth.uid());

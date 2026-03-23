-- 004_reservation_action_logs.sql
-- Journal des actions de réservation (audit)

create table if not exists public.reservation_action_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  action_type varchar(50) not null,
  action_label varchar(180) not null,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.reservation_action_logs is 'Historique des actions métier sur les réservations.';

create index if not exists idx_reservation_action_logs_reservation on public.reservation_action_logs(reservation_id, created_at desc);
create index if not exists idx_reservation_action_logs_org_est on public.reservation_action_logs(organization_id, establishment_id);

alter table public.reservation_action_logs enable row level security;

drop policy if exists reservation_action_logs_auth_all on public.reservation_action_logs;
create policy reservation_action_logs_auth_all on public.reservation_action_logs
for all to authenticated
using (public.can_access_establishment_row(organization_id, establishment_id))
with check (public.can_access_establishment_row(organization_id, establishment_id));

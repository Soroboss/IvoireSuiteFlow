-- 003_rls_policies.sql
-- RLS IvoireSuiteFlow

-- =========================
-- Fonctions helper RLS
-- =========================
create or replace function public.current_user_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.organization_id
  from public.profiles p
  where p.id = auth.uid();
$$;

create or replace function public.current_user_role()
returns user_role_enum
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid();
$$;

create or replace function public.current_user_establishment_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.establishment_id
  from public.profiles p
  where p.id = auth.uid();
$$;

create or replace function public.can_access_org_row(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
     and p_organization_id = public.current_user_org_id();
$$;

create or replace function public.can_access_establishment_row(p_organization_id uuid, p_establishment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
     and p_organization_id = public.current_user_org_id()
     and (
       public.current_user_role() <> 'receptionist'
       or p_establishment_id = public.current_user_establishment_id()
     );
$$;

create or replace function public.can_manage_org()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'super_admin';
$$;

create or replace function public.can_manage_profiles()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in ('super_admin','admin');
$$;

-- =========================
-- Activation RLS
-- =========================
alter table public.organizations enable row level security;
alter table public.establishments enable row level security;
alter table public.profiles enable row level security;
alter table public.room_types enable row level security;
alter table public.rooms enable row level security;
alter table public.seasons enable row level security;
alter table public.clients enable row level security;
alter table public.reservations enable row level security;
alter table public.extras enable row level security;
alter table public.reservation_extras enable row level security;
alter table public.payments enable row level security;
alter table public.housekeeping_tasks enable row level security;
alter table public.maintenance_requests enable row level security;
alter table public.daily_reports enable row level security;
alter table public.invoices enable row level security;

-- =========================
-- organizations
-- =========================
drop policy if exists organizations_select on public.organizations;
drop policy if exists organizations_modify on public.organizations;

create policy organizations_select on public.organizations
for select
using (public.can_access_org_row(id));

create policy organizations_modify on public.organizations
for all
using (public.can_access_org_row(id) and public.can_manage_org())
with check (public.can_access_org_row(id) and public.can_manage_org());

-- =========================
-- establishments (auth users)
-- =========================
drop policy if exists establishments_auth_select on public.establishments;
drop policy if exists establishments_auth_modify on public.establishments;
drop policy if exists establishments_public_select on public.establishments;

create policy establishments_auth_select on public.establishments
for select
to authenticated
using (public.can_access_establishment_row(organization_id, id));

create policy establishments_auth_modify on public.establishments
for all
to authenticated
using (public.can_access_establishment_row(organization_id, id))
with check (public.can_access_establishment_row(organization_id, id));

-- page publique : établissements actifs
create policy establishments_public_select on public.establishments
for select
to anon
using (is_active = true);

-- =========================
-- profiles
-- =========================
drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_modify on public.profiles;

create policy profiles_select on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or (public.can_access_org_row(organization_id) and public.can_manage_profiles())
);

create policy profiles_modify on public.profiles
for all
to authenticated
using (
  id = auth.uid()
  or (public.can_access_org_row(organization_id) and public.can_manage_profiles())
)
with check (
  id = auth.uid()
  or (public.can_access_org_row(organization_id) and public.can_manage_profiles())
);

-- =========================
-- Tables filtrées org + établissement
-- =========================
drop policy if exists room_types_auth_all on public.room_types;
create policy room_types_auth_all on public.room_types
for all to authenticated
using (public.can_access_establishment_row(organization_id, establishment_id))
with check (public.can_access_establishment_row(organization_id, establishment_id));

drop policy if exists rooms_auth_all on public.rooms;
create policy rooms_auth_all on public.rooms
for all to authenticated
using (public.can_access_establishment_row(organization_id, establishment_id))
with check (public.can_access_establishment_row(organization_id, establishment_id));

drop policy if exists rooms_public_select on public.rooms;
create policy rooms_public_select on public.rooms
for select to anon
using (is_active = true);

drop policy if exists seasons_auth_all on public.seasons;
create policy seasons_auth_all on public.seasons
for all to authenticated
using (public.can_access_establishment_row(organization_id, establishment_id))
with check (public.can_access_establishment_row(organization_id, establishment_id));

drop policy if exists clients_auth_all on public.clients;
create policy clients_auth_all on public.clients
for all to authenticated
using (
  public.can_access_org_row(organization_id)
  and (public.current_user_role() <> 'receptionist' or true)
)
with check (
  public.can_access_org_row(organization_id)
);

drop policy if exists reservations_auth_all on public.reservations;
create policy reservations_auth_all on public.reservations
for all to authenticated
using (public.can_access_establishment_row(organization_id, establishment_id))
with check (public.can_access_establishment_row(organization_id, establishment_id));

drop policy if exists extras_auth_all on public.extras;
create policy extras_auth_all on public.extras
for all to authenticated
using (public.can_access_establishment_row(organization_id, establishment_id))
with check (public.can_access_establishment_row(organization_id, establishment_id));

drop policy if exists extras_public_select on public.extras;
create policy extras_public_select on public.extras
for select to anon
using (is_active = true);

drop policy if exists reservation_extras_auth_all on public.reservation_extras;
create policy reservation_extras_auth_all on public.reservation_extras
for all to authenticated
using (
  public.can_access_org_row(organization_id)
  and exists (
    select 1 from public.reservations r
    where r.id = reservation_id
      and public.can_access_establishment_row(r.organization_id, r.establishment_id)
  )
)
with check (
  public.can_access_org_row(organization_id)
  and exists (
    select 1 from public.reservations r
    where r.id = reservation_id
      and public.can_access_establishment_row(r.organization_id, r.establishment_id)
  )
);

drop policy if exists payments_auth_all on public.payments;
create policy payments_auth_all on public.payments
for all to authenticated
using (public.can_access_establishment_row(organization_id, establishment_id))
with check (public.can_access_establishment_row(organization_id, establishment_id));

drop policy if exists housekeeping_auth_all on public.housekeeping_tasks;
create policy housekeeping_auth_all on public.housekeeping_tasks
for all to authenticated
using (public.can_access_establishment_row(organization_id, establishment_id))
with check (public.can_access_establishment_row(organization_id, establishment_id));

drop policy if exists maintenance_auth_all on public.maintenance_requests;
create policy maintenance_auth_all on public.maintenance_requests
for all to authenticated
using (public.can_access_establishment_row(organization_id, establishment_id))
with check (public.can_access_establishment_row(organization_id, establishment_id));

drop policy if exists daily_reports_auth_all on public.daily_reports;
create policy daily_reports_auth_all on public.daily_reports
for all to authenticated
using (public.can_access_establishment_row(organization_id, establishment_id))
with check (public.can_access_establishment_row(organization_id, establishment_id));

drop policy if exists invoices_auth_all on public.invoices;
create policy invoices_auth_all on public.invoices
for all to authenticated
using (public.can_access_establishment_row(organization_id, establishment_id))
with check (public.can_access_establishment_row(organization_id, establishment_id));

-- =========================
-- Grants publics restreints
-- =========================
grant select (id, name, slug, type, city, neighborhood, country, phone, whatsapp, cover_image_url, description, currency, timezone)
on public.establishments to anon;
grant select (id, establishment_id, name, description, capacity_adults, capacity_children, base_price_hour, base_price_night, base_price_week, base_price_month, base_price_day_pass, amenities, images)
on public.room_types to anon;
grant select (id, establishment_id, room_type_id, room_number, floor, status)
on public.rooms to anon;

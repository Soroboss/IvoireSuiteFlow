-- 001_initial_schema.sql
-- Schéma initial IvoireSuiteFlow

create extension if not exists pgcrypto;

-- =========================
-- ENUMS
-- =========================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'subscription_plan_enum') then
    create type subscription_plan_enum as enum ('trial','starter','pro','business');
  end if;
  if not exists (select 1 from pg_type where typname = 'subscription_status_enum') then
    create type subscription_status_enum as enum ('active','trial','expired','cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'establishment_type_enum') then
    create type establishment_type_enum as enum ('hotel','residence_meublee','auberge','motel','maison_hotes','appart_hotel');
  end if;
  if not exists (select 1 from pg_type where typname = 'user_role_enum') then
    create type user_role_enum as enum ('super_admin','admin','receptionist','cashier','housekeeper','accountant','manager');
  end if;
  if not exists (select 1 from pg_type where typname = 'room_status_enum') then
    create type room_status_enum as enum ('available','occupied','cleaning','maintenance','out_of_service');
  end if;
  if not exists (select 1 from pg_type where typname = 'season_applies_to_enum') then
    create type season_applies_to_enum as enum ('all','night','hour','stay','pass');
  end if;
  if not exists (select 1 from pg_type where typname = 'client_type_enum') then
    create type client_type_enum as enum ('individual','corporate','agency','ngo','embassy');
  end if;
  if not exists (select 1 from pg_type where typname = 'id_type_enum') then
    create type id_type_enum as enum ('cni','passport','carte_sejour','permis','carte_consulaire','attestation','other');
  end if;
  if not exists (select 1 from pg_type where typname = 'booking_mode_enum') then
    create type booking_mode_enum as enum ('hourly','nightly','stay','pass');
  end if;
  if not exists (select 1 from pg_type where typname = 'reservation_status_enum') then
    create type reservation_status_enum as enum ('pending','confirmed','checked_in','checked_out','cancelled','no_show','expired');
  end if;
  if not exists (select 1 from pg_type where typname = 'reservation_source_enum') then
    create type reservation_source_enum as enum ('walk_in','online','phone','whatsapp','corporate');
  end if;
  if not exists (select 1 from pg_type where typname = 'deposit_status_enum') then
    create type deposit_status_enum as enum ('none','pending','paid','returned','retained');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_status_enum') then
    create type payment_status_enum as enum ('unpaid','partial','paid','refunded');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_method_enum') then
    create type payment_method_enum as enum ('cash','orange_money','mtn_momo','wave','moov_money','card','transfer','corporate');
  end if;
  if not exists (select 1 from pg_type where typname = 'extra_category_enum') then
    create type extra_category_enum as enum ('food','laundry','transport','leisure','equipment','other');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_type_enum') then
    create type payment_type_enum as enum ('reservation','extra','deposit','penalty','refund','monthly_rent');
  end if;
  if not exists (select 1 from pg_type where typname = 'housekeeping_status_enum') then
    create type housekeeping_status_enum as enum ('pending','in_progress','completed','verified');
  end if;
  if not exists (select 1 from pg_type where typname = 'housekeeping_task_type_enum') then
    create type housekeeping_task_type_enum as enum ('checkout_clean','stay_clean','deep_clean','inspection');
  end if;
  if not exists (select 1 from pg_type where typname = 'maintenance_priority_enum') then
    create type maintenance_priority_enum as enum ('low','medium','high','urgent');
  end if;
  if not exists (select 1 from pg_type where typname = 'maintenance_status_enum') then
    create type maintenance_status_enum as enum ('reported','in_progress','resolved','cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'daily_report_status_enum') then
    create type daily_report_status_enum as enum ('open','closed','verified');
  end if;
  if not exists (select 1 from pg_type where typname = 'invoice_type_enum') then
    create type invoice_type_enum as enum ('invoice','proforma','credit_note','receipt');
  end if;
end$$;

-- =========================
-- FONCTION TRIGGER UPDATED_AT
-- =========================
create or replace function public.fn_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================
-- TABLES
-- =========================

-- Organisations abonnées
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name varchar(200) not null,
  email varchar(255) not null,
  phone varchar(30),
  address text,
  city varchar(120),
  country varchar(2) not null default 'CI',
  subscription_plan subscription_plan_enum not null default 'trial',
  subscription_status subscription_status_enum not null default 'trial',
  trial_ends_at timestamptz,
  subscription_ends_at timestamptz,
  max_establishments integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_max_establishments_check check (max_establishments is null or max_establishments > 0)
);
comment on table public.organizations is 'Entreprises/propriétaires utilisant IvoireSuiteFlow.';

-- Établissements (hôtel/résidence/auberge...)
create table if not exists public.establishments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name varchar(200) not null,
  slug varchar(180) not null unique,
  type establishment_type_enum not null,
  address text,
  city varchar(120),
  neighborhood varchar(120),
  country varchar(2) not null default 'CI',
  phone varchar(30),
  whatsapp varchar(30),
  email varchar(255),
  website text,
  star_rating smallint not null default 0 check (star_rating between 0 and 5),
  logo_url text,
  cover_image_url text,
  description text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  currency varchar(3) not null default 'XOF',
  timezone varchar(50) not null default 'Africa/Abidjan',
  settings jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.establishments is 'Sites gérés par une organisation.';

-- Profils utilisateurs liés à auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  establishment_id uuid references public.establishments(id) on delete set null,
  full_name varchar(200) not null,
  phone varchar(30),
  email varchar(255),
  avatar_url text,
  role user_role_enum not null default 'receptionist',
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.profiles is 'Profils applicatifs des utilisateurs.';

-- Types de logement
create table if not exists public.room_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  name varchar(150) not null,
  description text,
  capacity_adults smallint not null default 1 check (capacity_adults >= 0),
  capacity_children smallint not null default 0 check (capacity_children >= 0),
  base_price_hour numeric(12,2) check (base_price_hour >= 0),
  base_price_night numeric(12,2) check (base_price_night >= 0),
  base_price_week numeric(12,2) check (base_price_week >= 0),
  base_price_month numeric(12,2) check (base_price_month >= 0),
  base_price_day_pass numeric(12,2) check (base_price_day_pass >= 0),
  weekend_price_night numeric(12,2) check (weekend_price_night >= 0),
  high_season_price_night numeric(12,2) check (high_season_price_night >= 0),
  holiday_price_night numeric(12,2) check (holiday_price_night >= 0),
  deposit_amount numeric(12,2) default 0 check (deposit_amount >= 0),
  amenities text[] not null default '{}',
  images text[] not null default '{}',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (establishment_id, name)
);
comment on table public.room_types is 'Catalogue de types de chambres/logements par établissement.';

-- Chambres/logements unitaires
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  room_type_id uuid not null references public.room_types(id) on delete restrict,
  room_number varchar(50) not null,
  floor varchar(30),
  status room_status_enum not null default 'available',
  current_reservation_id uuid,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (establishment_id, room_number)
);
comment on table public.rooms is 'Unités réservables (chambre, studio, appartement, suite...).';

-- Saisons tarifaires
create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  name varchar(150) not null,
  start_date date not null,
  end_date date not null,
  price_multiplier numeric(6,3) not null check (price_multiplier > 0),
  applies_to season_applies_to_enum not null default 'all',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint seasons_dates_check check (end_date >= start_date)
);
comment on table public.seasons is 'Périodes saisonnières qui modifient les tarifs.';

-- Clients organisationnels
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_type client_type_enum not null default 'individual',
  full_name varchar(200) not null,
  phone varchar(30),
  email varchar(255),
  id_type id_type_enum,
  id_number varchar(120),
  id_document_url text,
  company_name varchar(200),
  address text,
  city varchar(120),
  country varchar(2) default 'CI',
  notes text,
  is_blacklisted boolean not null default false,
  blacklist_reason text,
  total_stays integer not null default 0 check (total_stays >= 0),
  total_spent numeric(14,2) not null default 0 check (total_spent >= 0),
  loyalty_points integer not null default 0 check (loyalty_points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.clients is 'Base clients partagée au niveau de l''organisation.';

-- Réservations
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete restrict,
  client_id uuid references public.clients(id) on delete set null,
  booking_ref varchar(20) not null unique,
  booking_mode booking_mode_enum not null,
  status reservation_status_enum not null default 'pending',
  source reservation_source_enum not null default 'walk_in',
  check_in_at timestamptz not null,
  check_out_at timestamptz not null,
  actual_check_in timestamptz,
  actual_check_out timestamptz,
  hours smallint check (hours is null or hours > 0),
  nights smallint check (nights is null or nights >= 0),
  pass_type varchar(30),
  base_amount numeric(12,2) not null default 0 check (base_amount >= 0),
  extras_amount numeric(12,2) not null default 0 check (extras_amount >= 0),
  tax_amount numeric(12,2) not null default 0 check (tax_amount >= 0),
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  total_amount numeric(12,2) not null default 0,
  deposit_amount numeric(12,2) not null default 0 check (deposit_amount >= 0),
  deposit_status deposit_status_enum not null default 'none',
  payment_status payment_status_enum not null default 'unpaid',
  payment_method payment_method_enum,
  notes text,
  internal_notes text,
  created_by uuid references public.profiles(id) on delete set null,
  qr_code text,
  contract_url text,
  timer_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservations_period_check check (check_out_at > check_in_at)
);
comment on table public.reservations is 'Table centrale de toutes les réservations.';

alter table public.rooms
  add constraint rooms_current_reservation_fk
  foreign key (current_reservation_id)
  references public.reservations(id)
  on delete set null;

-- Extras facturables
create table if not exists public.extras (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  name varchar(150) not null,
  price numeric(12,2) not null check (price >= 0),
  category extra_category_enum not null default 'other',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.extras is 'Produits et services additionnels.';

-- Lignes d'extras par réservation
create table if not exists public.reservation_extras (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  extra_id uuid not null references public.extras(id) on delete restrict,
  quantity smallint not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  total_price numeric(12,2) not null check (total_price >= 0),
  date_added timestamptz not null default now(),
  added_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.reservation_extras is 'Détails des extras consommés par réservation.';

-- Paiements/encaissements
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  reservation_id uuid references public.reservations(id) on delete set null,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  payment_method payment_method_enum not null,
  payment_type payment_type_enum not null default 'reservation',
  reference varchar(120),
  received_by uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.payments is 'Flux financiers liés aux réservations et services.';

-- Tâches housekeeping
create table if not exists public.housekeeping_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  status housekeeping_status_enum not null default 'pending',
  task_type housekeeping_task_type_enum not null,
  checklist jsonb not null default '{}'::jsonb,
  notes text,
  started_at timestamptz,
  completed_at timestamptz,
  verified_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.housekeeping_tasks is 'Suivi de nettoyage et inspection des logements.';

-- Demandes de maintenance
create table if not exists public.maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  reported_by uuid references public.profiles(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  issue text not null,
  priority maintenance_priority_enum not null default 'medium',
  status maintenance_status_enum not null default 'reported',
  resolution_notes text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.maintenance_requests is 'Incidents techniques et leur résolution.';

-- Rapports journaliers de caisse
create table if not exists public.daily_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  report_date date not null,
  opened_by uuid references public.profiles(id) on delete set null,
  closed_by uuid references public.profiles(id) on delete set null,
  opening_cash numeric(12,2) not null default 0,
  closing_cash numeric(12,2) not null default 0,
  total_cash numeric(12,2) not null default 0,
  total_orange_money numeric(12,2) not null default 0,
  total_mtn_momo numeric(12,2) not null default 0,
  total_wave numeric(12,2) not null default 0,
  total_moov numeric(12,2) not null default 0,
  total_card numeric(12,2) not null default 0,
  total_transfer numeric(12,2) not null default 0,
  total_corporate numeric(12,2) not null default 0,
  total_revenue numeric(12,2) not null default 0,
  total_reservations integer not null default 0,
  total_checkins integer not null default 0,
  total_checkouts integer not null default 0,
  occupancy_rate numeric(5,2) not null default 0,
  variance numeric(12,2) not null default 0,
  notes text,
  status daily_report_status_enum not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (establishment_id, report_date)
);
comment on table public.daily_reports is 'Rapport Z quotidien par établissement.';

-- Factures
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  reservation_id uuid references public.reservations(id) on delete set null,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  invoice_number varchar(30) not null unique,
  type invoice_type_enum not null default 'invoice',
  subtotal numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  due_date date,
  paid_at timestamptz,
  pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.invoices is 'Factures, proformas, avoirs et reçus.';

-- =========================
-- INDEXES
-- =========================
create index if not exists idx_establishments_org on public.establishments(organization_id);
create index if not exists idx_profiles_org on public.profiles(organization_id);
create index if not exists idx_profiles_est on public.profiles(establishment_id);
create index if not exists idx_room_types_org_est on public.room_types(organization_id, establishment_id);
create index if not exists idx_rooms_org_est on public.rooms(organization_id, establishment_id);
create index if not exists idx_rooms_status on public.rooms(status);
create index if not exists idx_seasons_org_est_dates on public.seasons(organization_id, establishment_id, start_date, end_date);
create index if not exists idx_clients_org on public.clients(organization_id);
create index if not exists idx_clients_phone on public.clients(phone);
create index if not exists idx_reservations_org_est on public.reservations(organization_id, establishment_id);
create index if not exists idx_reservations_status on public.reservations(status);
create index if not exists idx_reservations_checkin_checkout on public.reservations(check_in_at, check_out_at);
create index if not exists idx_reservations_mode on public.reservations(booking_mode);
create index if not exists idx_extras_org_est on public.extras(organization_id, establishment_id);
create index if not exists idx_reservation_extras_reservation on public.reservation_extras(reservation_id);
create index if not exists idx_payments_org_est_created on public.payments(organization_id, establishment_id, created_at);
create index if not exists idx_housekeeping_org_est_status on public.housekeeping_tasks(organization_id, establishment_id, status);
create index if not exists idx_maintenance_org_est_status on public.maintenance_requests(organization_id, establishment_id, status);
create index if not exists idx_daily_reports_org_est_date on public.daily_reports(organization_id, establishment_id, report_date);
create index if not exists idx_invoices_org_est_created on public.invoices(organization_id, establishment_id, created_at);

-- =========================
-- TRIGGERS updated_at
-- =========================
create trigger trg_organizations_updated_at before update on public.organizations for each row execute function public.fn_set_updated_at();
create trigger trg_establishments_updated_at before update on public.establishments for each row execute function public.fn_set_updated_at();
create trigger trg_profiles_updated_at before update on public.profiles for each row execute function public.fn_set_updated_at();
create trigger trg_room_types_updated_at before update on public.room_types for each row execute function public.fn_set_updated_at();
create trigger trg_rooms_updated_at before update on public.rooms for each row execute function public.fn_set_updated_at();
create trigger trg_seasons_updated_at before update on public.seasons for each row execute function public.fn_set_updated_at();
create trigger trg_clients_updated_at before update on public.clients for each row execute function public.fn_set_updated_at();
create trigger trg_reservations_updated_at before update on public.reservations for each row execute function public.fn_set_updated_at();
create trigger trg_extras_updated_at before update on public.extras for each row execute function public.fn_set_updated_at();
create trigger trg_reservation_extras_updated_at before update on public.reservation_extras for each row execute function public.fn_set_updated_at();
create trigger trg_payments_updated_at before update on public.payments for each row execute function public.fn_set_updated_at();
create trigger trg_housekeeping_tasks_updated_at before update on public.housekeeping_tasks for each row execute function public.fn_set_updated_at();
create trigger trg_maintenance_requests_updated_at before update on public.maintenance_requests for each row execute function public.fn_set_updated_at();
create trigger trg_daily_reports_updated_at before update on public.daily_reports for each row execute function public.fn_set_updated_at();
create trigger trg_invoices_updated_at before update on public.invoices for each row execute function public.fn_set_updated_at();

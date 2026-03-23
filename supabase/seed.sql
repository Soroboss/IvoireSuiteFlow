-- seed.sql
-- Données de test IvoireSuiteFlow

-- =========================
-- IDs fixes pour seed reproductible
-- =========================
-- Organisation
-- BOSS IMPACT HOSPITALITY

insert into public.organizations (
  id, name, email, phone, address, city, country,
  subscription_plan, subscription_status, max_establishments, trial_ends_at, subscription_ends_at
)
values (
  '11111111-1111-1111-1111-111111111111',
  'BOSS IMPACT HOSPITALITY',
  'contact@bossimpact.ci',
  '+2250700000000',
  'Cocody Angré 8ème Tranche',
  'Abidjan',
  'CI',
  'business',
  'active',
  null,
  now() + interval '14 days',
  now() + interval '365 days'
)
on conflict (id) do nothing;

-- =========================
-- Utilisateurs Auth + Profiles
-- =========================
insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
)
values
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'authenticated',
  'authenticated',
  'admin@ivoiresuiteflow.com',
  crypt('Admin@12345', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Admin IvoireSuiteFlow"}'::jsonb
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'authenticated',
  'authenticated',
  'reception@ivoiresuiteflow.com',
  crypt('Reception@12345', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Réception Angré"}'::jsonb
)
on conflict (id) do nothing;

-- Identités email (requis pour signInWithPassword côté GoTrue)
insert into auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(),
  u.id,
  jsonb_build_object(
    'sub', u.id::text,
    'email', u.email,
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  u.id::text,
  now(),
  now(),
  now()
from auth.users u
where u.email in ('admin@ivoiresuiteflow.com', 'reception@ivoiresuiteflow.com')
  and not exists (
    select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email'
  );

insert into public.establishments (
  id, organization_id, name, slug, type, address, city, neighborhood, country, phone, whatsapp, email,
  star_rating, currency, timezone, settings, is_active
)
values
(
  '22222222-2222-2222-2222-222222222221',
  '11111111-1111-1111-1111-111111111111',
  'Résidence IvoireSuite Angré',
  'residence-angre-cocody',
  'residence_meublee',
  'Angré 8ème tranche, Cocody',
  'Abidjan',
  'Angré 8ème tranche',
  'CI',
  '+2250701010101',
  '+2250701010101',
  'angre@ivoiresuiteflow.com',
  3,
  'XOF',
  'Africa/Abidjan',
  '{
    "min_hourly_duration":1,
    "max_hourly_duration":6,
    "night_surcharge_amount":3000,
    "night_surcharge_start":"22:00",
    "night_surcharge_end":"06:00",
    "default_checkin_time":"14:00",
    "default_checkout_time":"12:00",
    "require_id_for_hourly":false,
    "weekly_discount_pct":10,
    "biweekly_discount_pct":15,
    "monthly_discount_pct":25
  }'::jsonb,
  true
),
(
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Hôtel IvoireSuite Plateau',
  'hotel-ivoiresuite-plateau',
  'hotel',
  'Avenue Lamblin, Plateau',
  'Abidjan',
  'Plateau',
  'CI',
  '+2250702020202',
  '+2250702020202',
  'plateau@ivoiresuiteflow.com',
  4,
  'XOF',
  'Africa/Abidjan',
  '{"default_checkin_time":"14:00","default_checkout_time":"12:00"}'::jsonb,
  true
)
on conflict (id) do nothing;

insert into public.profiles (
  id, organization_id, establishment_id, full_name, phone, email, role, is_active
)
values
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  null,
  'Admin IvoireSuiteFlow',
  '+2250703030303',
  'admin@ivoiresuiteflow.com',
  'super_admin',
  true
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222221',
  'Réception Angré',
  '+2250704040404',
  'reception@ivoiresuiteflow.com',
  'receptionist',
  true
)
on conflict (id) do nothing;

-- =========================
-- Types de logements + chambres
-- =========================
insert into public.room_types (
  id, organization_id, establishment_id, name, capacity_adults, capacity_children,
  base_price_hour, base_price_night, base_price_week, base_price_month, base_price_day_pass,
  deposit_amount, amenities, is_active, sort_order
)
values
-- Résidence Angré
('33333333-3333-3333-3333-333333333301','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222221','Studio',2,1,5000,20000,100000,300000,12000,50000,ARRAY['clim','tv','wifi','frigo'],true,1),
('33333333-3333-3333-3333-333333333302','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222221','Appart 2 pièces',4,2,8000,35000,180000,500000,18000,100000,ARRAY['clim','tv','wifi','cuisine_equipee','salon'],true,2),
('33333333-3333-3333-3333-333333333303','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222221','Suite',3,1,15000,65000,350000,900000,25000,150000,ARRAY['clim','tv','wifi','minibar','balcon'],true,3),
('33333333-3333-3333-3333-333333333304','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222221','Penthouse',6,2,25000,120000,650000,1800000,50000,300000,ARRAY['clim','tv','wifi','cuisine_equipee','terrasse','vue_lagune'],true,4),
-- Hôtel Plateau
('33333333-3333-3333-3333-333333333305','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','Standard',2,1,4000,15000,80000,250000,10000,25000,ARRAY['clim','tv','wifi'],true,1),
('33333333-3333-3333-3333-333333333306','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','Confort',2,1,7000,30000,160000,450000,15000,50000,ARRAY['clim','tv','wifi','frigo'],true,2),
('33333333-3333-3333-3333-333333333307','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','Suite VIP',3,1,15000,65000,350000,900000,25000,150000,ARRAY['clim','tv','wifi','minibar','coffre_fort'],true,3),
('33333333-3333-3333-3333-333333333308','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','Présidentielle',4,2,25000,120000,650000,1800000,50000,300000,ARRAY['clim','tv','wifi','salon','vue_lagune','coffre_fort'],true,4)
on conflict (id) do nothing;

insert into public.rooms (
  id, organization_id, establishment_id, room_type_id, room_number, floor, status, is_active
)
values
-- Résidence Angré (10)
('44444444-4444-4444-4444-444444444401','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222221','33333333-3333-3333-3333-333333333301','Studio 1','RDC','available',true),
('44444444-4444-4444-4444-444444444402','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222221','33333333-3333-3333-3333-333333333301','Studio 2','RDC','available',true),
('44444444-4444-4444-4444-444444444403','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222221','33333333-3333-3333-3333-333333333301','Studio 3','1','available',true),
('44444444-4444-4444-4444-444444444404','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222221','33333333-3333-3333-3333-333333333301','Studio 4','1','available',true),
('44444444-4444-4444-4444-444444444405','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222221','33333333-3333-3333-3333-333333333302','Appart A1','1','available',true),
('44444444-4444-4444-4444-444444444406','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222221','33333333-3333-3333-3333-333333333302','Appart A2','2','available',true),
('44444444-4444-4444-4444-444444444407','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222221','33333333-3333-3333-3333-333333333302','Appart A3','2','available',true),
('44444444-4444-4444-4444-444444444408','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222221','33333333-3333-3333-3333-333333333303','Suite S1','2','available',true),
('44444444-4444-4444-4444-444444444409','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222221','33333333-3333-3333-3333-333333333303','Suite S2','3','available',true),
('44444444-4444-4444-4444-444444444410','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222221','33333333-3333-3333-3333-333333333304','Penthouse P1','3','available',true),
-- Hôtel Plateau (8)
('44444444-4444-4444-4444-444444444411','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333305','101','1','available',true),
('44444444-4444-4444-4444-444444444412','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333305','102','1','available',true),
('44444444-4444-4444-4444-444444444413','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333305','103','1','available',true),
('44444444-4444-4444-4444-444444444414','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333305','104','1','available',true),
('44444444-4444-4444-4444-444444444415','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333306','201','2','available',true),
('44444444-4444-4444-4444-444444444416','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333306','202','2','available',true),
('44444444-4444-4444-4444-444444444417','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333307','301','3','available',true),
('44444444-4444-4444-4444-444444444418','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333308','401','4','available',true)
on conflict (id) do nothing;

-- =========================
-- Clients (5)
-- =========================
insert into public.clients (
  id, organization_id, client_type, full_name, phone, email, id_type, id_number, company_name, city, country, notes
)
values
('55555555-5555-5555-5555-555555555501','11111111-1111-1111-1111-111111111111','individual','Kouassi Jean Marc','+2250101111111','jean.kouassi@mail.com','cni','CI-12345678',null,'Abidjan','CI','Client régulier business'),
('55555555-5555-5555-5555-555555555502','11111111-1111-1111-1111-111111111111','individual','Traoré Aïssata','+2250102222222','aissata.traore@mail.com','passport','P-778899',null,'Bouaké','CI',null),
('55555555-5555-5555-5555-555555555503','11111111-1111-1111-1111-111111111111','corporate','Soro Ibrahim','+2250103333333','ibrahim.soro@abijansoft.ci','cni','CI-55667788','Abidjan Soft SARL','Abidjan','CI','Compte corporate'),
('55555555-5555-5555-5555-555555555504','11111111-1111-1111-1111-111111111111','agency','Travel Plus CI','+2250104444444','bookings@travelplus.ci','other','AG-2026-01','Travel Plus','Abidjan','CI','Agence partenaire'),
('55555555-5555-5555-5555-555555555505','11111111-1111-1111-1111-111111111111','ngo','ONG Santé Sud','+2250105555555','missions@santesud.org','carte_consulaire','CS-667788','ONG Santé Sud','Yamoussoukro','CI','Missions terrain')
on conflict (id) do nothing;

-- =========================
-- Extras (3)
-- =========================
insert into public.extras (
  id, organization_id, establishment_id, name, price, category, is_active, sort_order
)
values
('66666666-6666-6666-6666-666666666601','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222221','Petit-déjeuner',3500,'food',true,1),
('66666666-6666-6666-6666-666666666602','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222221','Blanchisserie 5kg',5000,'laundry',true,2),
('66666666-6666-6666-6666-666666666603','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222221','Transfert aéroport',15000,'transport',true,3)
on conflict (id) do nothing;

-- =========================
-- Saisons de test
-- =========================
insert into public.seasons (
  id, organization_id, establishment_id, name, start_date, end_date, price_multiplier, applies_to
)
values
('77777777-7777-7777-7777-777777777701','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222221','Fêtes de fin d''année',date '2026-12-20',date '2027-01-05',1.30,'all'),
('77777777-7777-7777-7777-777777777702','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','Haute Saison',date '2026-07-01',date '2026-09-30',1.20,'night')
on conflict (id) do nothing;

-- =========================
-- Réservations (8 : 2 par mode)
-- =========================
insert into public.reservations (
  id, organization_id, establishment_id, room_id, client_id, booking_ref, booking_mode, status, source,
  check_in_at, check_out_at, actual_check_in, actual_check_out, hours, nights, pass_type,
  base_amount, extras_amount, tax_amount, discount_amount, total_amount,
  payment_status, payment_method, created_by, timer_expires_at, notes
)
values
-- Hourly
('88888888-8888-8888-8888-888888888801','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222221','44444444-4444-4444-4444-444444444401','55555555-5555-5555-5555-555555555501','ISF-HR001','hourly','checked_out','walk_in',now() - interval '3 days 4 hours',now() - interval '3 days 2 hours',now() - interval '3 days 4 hours',now() - interval '3 days 2 hours',2,null,null,10000,0,0,0,10000,'paid','cash','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',now() - interval '3 days 2 hours','Réservation horaire terminée'),
('88888888-8888-8888-8888-888888888802','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','44444444-4444-4444-4444-444444444411','55555555-5555-5555-5555-555555555502','ISF-HR002','hourly','checked_in','walk_in',now() - interval '1 hour',now() + interval '2 hours',now() - interval '1 hour',null,3,null,null,12000,0,0,0,12000,'partial','orange_money','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',now() + interval '2 hours','Timer actif'),
-- Nightly
('88888888-8888-8888-8888-888888888803','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','44444444-4444-4444-4444-444444444412','55555555-5555-5555-5555-555555555503','ISF-NI001','nightly','confirmed','phone',now() + interval '1 day',now() + interval '3 days',null,null,null,2,null,30000,0,0,0,30000,'unpaid',null,'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',null,'Arrivée prévue demain'),
('88888888-8888-8888-8888-888888888804','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','44444444-4444-4444-4444-444444444415','55555555-5555-5555-5555-555555555504','ISF-NI002','nightly','checked_out','online',now() - interval '6 days',now() - interval '4 days',now() - interval '6 days',now() - interval '4 days',null,2,null,60000,3500,0,0,63500,'paid','wave','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',null,'Client agence'),
-- Stay
('88888888-8888-8888-8888-888888888805','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222221','44444444-4444-4444-4444-444444444405','55555555-5555-5555-5555-555555555503','ISF-ST001','stay','checked_in','corporate',now() - interval '10 days',now() + interval '20 days',now() - interval '10 days',null,null,30,null,500000,15000,0,50000,465000,'partial','transfer','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',null,'Séjour mission entreprise'),
('88888888-8888-8888-8888-888888888806','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222221','44444444-4444-4444-4444-444444444406','55555555-5555-5555-5555-555555555505','ISF-ST002','stay','pending','whatsapp',now() + interval '5 days',now() + interval '40 days',null,null,null,35,null,600000,0,0,60000,540000,'unpaid',null,'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',null,'En attente de validation'),
-- Pass
('88888888-8888-8888-8888-888888888807','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222221','44444444-4444-4444-4444-444444444408','55555555-5555-5555-5555-555555555501','ISF-PA001','pass','checked_out','walk_in',now() - interval '2 days 10 hours',now() - interval '2 days 2 hours',now() - interval '2 days 10 hours',now() - interval '2 days 2 hours',null,null,'day',12000,0,0,0,12000,'paid','cash','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',null,'Pass journée'),
('88888888-8888-8888-8888-888888888808','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','44444444-4444-4444-4444-444444444417','55555555-5555-5555-5555-555555555502','ISF-PA002','pass','confirmed','online',now() + interval '2 days 8 hours',now() + interval '2 days 12 hours',null,null,null,null,'half_day',15000,0,0,0,15000,'unpaid',null,'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',null,'Pass demi-journée')
on conflict (id) do nothing;

-- Extras sur réservations
insert into public.reservation_extras (
  id, organization_id, reservation_id, extra_id, quantity, unit_price, total_price, added_by
)
values
('99999999-9999-9999-9999-999999999901','11111111-1111-1111-1111-111111111111','88888888-8888-8888-8888-888888888804','66666666-6666-6666-6666-666666666601',1,3500,3500,'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('99999999-9999-9999-9999-999999999902','11111111-1111-1111-1111-111111111111','88888888-8888-8888-8888-888888888805','66666666-6666-6666-6666-666666666603',1,15000,15000,'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
on conflict (id) do nothing;

-- Paiements de test
insert into public.payments (
  id, organization_id, reservation_id, establishment_id, amount, payment_method, payment_type, reference, received_by, notes
)
values
('aaaaaaaa-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111','88888888-8888-8888-8888-888888888801','22222222-2222-2222-2222-222222222221',10000,'cash','reservation','REC-001','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','Paiement comptant'),
('aaaaaaaa-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111','88888888-8888-8888-8888-888888888802','22222222-2222-2222-2222-222222222222',6000,'orange_money','reservation','OM-009988','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','Acompte'),
('aaaaaaaa-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111','88888888-8888-8888-8888-888888888804','22222222-2222-2222-2222-222222222222',63500,'wave','reservation','WV-454545','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Paiement complet')
on conflict (id) do nothing;

-- Mise à jour des statuts chambres via trigger
update public.reservations
set status = status
where id in (
  '88888888-8888-8888-8888-888888888802',
  '88888888-8888-8888-8888-888888888805'
);

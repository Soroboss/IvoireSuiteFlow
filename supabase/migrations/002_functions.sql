-- 002_functions.sql
-- Fonctions métiers IvoireSuiteFlow

create or replace function public.generate_booking_ref(p_establishment_id uuid)
returns varchar
language plpgsql
as $$
declare
  v_ref varchar(20);
  v_exists boolean;
begin
  loop
    v_ref := 'ISF-' || upper(substr(md5(random()::text || clock_timestamp()::text || p_establishment_id::text), 1, 6));
    select exists(select 1 from public.reservations r where r.booking_ref = v_ref) into v_exists;
    exit when not v_exists;
  end loop;
  return v_ref;
end;
$$;

create or replace function public.generate_invoice_number(p_establishment_id uuid)
returns varchar
language plpgsql
as $$
declare
  v_year text := to_char(now(), 'YYYY');
  v_next integer;
begin
  select coalesce(max(split_part(i.invoice_number, '-', 3)::int), 0) + 1
    into v_next
  from public.invoices i
  where i.establishment_id = p_establishment_id
    and split_part(i.invoice_number, '-', 2) = v_year;

  return 'ISF-' || v_year || '-' || lpad(v_next::text, 5, '0');
end;
$$;

create or replace function public.calculate_reservation_amount(p_reservation_id uuid)
returns numeric
language plpgsql
as $$
declare
  v_res public.reservations%rowtype;
  v_rt public.room_types%rowtype;
  v_multiplier numeric := 1;
  v_amount numeric := 0;
  v_nights integer;
begin
  select * into v_res from public.reservations where id = p_reservation_id;
  if not found then
    raise exception 'Réservation introuvable: %', p_reservation_id;
  end if;

  select rt.* into v_rt
  from public.room_types rt
  join public.rooms r on r.room_type_id = rt.id
  where r.id = v_res.room_id;

  select coalesce(max(s.price_multiplier), 1)
    into v_multiplier
  from public.seasons s
  where s.establishment_id = v_res.establishment_id
    and v_res.check_in_at::date between s.start_date and s.end_date
    and (s.applies_to = 'all'
         or (s.applies_to = 'hour' and v_res.booking_mode = 'hourly')
         or (s.applies_to = 'night' and v_res.booking_mode = 'nightly')
         or (s.applies_to = 'stay' and v_res.booking_mode = 'stay')
         or (s.applies_to = 'pass' and v_res.booking_mode = 'pass'));

  if v_res.booking_mode = 'hourly' then
    v_amount := coalesce(v_rt.base_price_hour, 0) * coalesce(v_res.hours, 1);
  elsif v_res.booking_mode = 'nightly' then
    v_nights := greatest(1, (extract(epoch from (v_res.check_out_at - v_res.check_in_at)) / 86400)::int);
    v_amount := coalesce(v_rt.base_price_night, 0) * v_nights;
  elsif v_res.booking_mode = 'stay' then
    v_nights := greatest(1, (extract(epoch from (v_res.check_out_at - v_res.check_in_at)) / 86400)::int);
    if v_nights >= 28 then
      v_amount := coalesce(v_rt.base_price_month, 0) * (v_nights / 28.0);
    elsif v_nights >= 7 then
      v_amount := coalesce(v_rt.base_price_week, 0) * (v_nights / 7.0);
    else
      v_amount := coalesce(v_rt.base_price_night, 0) * v_nights;
    end if;
  elsif v_res.booking_mode = 'pass' then
    v_amount := coalesce(v_rt.base_price_day_pass, coalesce(v_rt.base_price_night, 0));
  end if;

  v_amount := (v_amount * v_multiplier)
              + coalesce(v_res.extras_amount, 0)
              + coalesce(v_res.tax_amount, 0)
              - coalesce(v_res.discount_amount, 0);

  if v_amount < 0 then
    v_amount := 0;
  end if;

  update public.reservations
    set total_amount = v_amount
  where id = p_reservation_id;

  return v_amount;
end;
$$;

create or replace function public.fn_update_room_status()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.status in ('confirmed', 'checked_in') then
      update public.rooms
      set status = case when new.status = 'checked_in' then 'occupied' else status end,
          current_reservation_id = new.id
      where id = new.room_id;
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.status in ('checked_out', 'cancelled', 'no_show', 'expired') then
      update public.rooms
      set status = 'available',
          current_reservation_id = null
      where id = new.room_id
        and current_reservation_id = new.id;
    elsif new.status = 'checked_in' then
      update public.rooms
      set status = 'occupied',
          current_reservation_id = new.id
      where id = new.room_id;
    elsif new.status = 'confirmed' then
      update public.rooms
      set current_reservation_id = new.id
      where id = new.room_id;
    end if;
    return new;
  end if;

  return new;
end;
$$;

create or replace function public.fn_update_client_stats()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'checked_out' and old.status is distinct from 'checked_out' and new.client_id is not null then
    update public.clients
    set total_stays = total_stays + 1,
        total_spent = total_spent + coalesce(new.total_amount, 0),
        loyalty_points = loyalty_points + floor(coalesce(new.total_amount, 0) / 1000)::int
    where id = new.client_id;
  end if;
  return new;
end;
$$;

create or replace function public.get_occupancy_rate(p_establishment_id uuid, p_date date)
returns numeric
language sql
stable
as $$
  with total_rooms as (
    select count(*)::numeric as total
    from public.rooms r
    where r.establishment_id = p_establishment_id
      and r.is_active = true
  ),
  occupied_rooms as (
    select count(distinct rv.room_id)::numeric as occupied
    from public.reservations rv
    where rv.establishment_id = p_establishment_id
      and rv.status in ('confirmed','checked_in')
      and p_date between rv.check_in_at::date and rv.check_out_at::date
  )
  select case
    when tr.total = 0 then 0
    else round((oroom.occupied / tr.total) * 100, 2)
  end
  from total_rooms tr
  cross join occupied_rooms oroom;
$$;

create or replace function public.get_available_rooms(
  p_establishment_id uuid,
  p_check_in timestamptz,
  p_check_out timestamptz,
  p_booking_mode varchar
)
returns table (
  room_id uuid,
  room_number varchar,
  room_status room_status_enum,
  room_type_id uuid,
  room_type_name varchar
)
language sql
stable
as $$
  select
    r.id as room_id,
    r.room_number,
    r.status as room_status,
    rt.id as room_type_id,
    rt.name as room_type_name
  from public.rooms r
  join public.room_types rt on rt.id = r.room_type_id
  where r.establishment_id = p_establishment_id
    and r.is_active = true
    and r.status not in ('maintenance','out_of_service')
    and not exists (
      select 1
      from public.reservations rv
      where rv.room_id = r.id
        and rv.status in ('pending','confirmed','checked_in')
        and tstzrange(rv.check_in_at, rv.check_out_at, '[)') && tstzrange(p_check_in, p_check_out, '[)')
    );
$$;

create or replace function public.get_revenue_by_mode(
  p_establishment_id uuid,
  p_start date,
  p_end date
)
returns table (
  booking_mode booking_mode_enum,
  total_reservations bigint,
  total_revenue numeric
)
language sql
stable
as $$
  select
    r.booking_mode,
    count(*)::bigint as total_reservations,
    coalesce(sum(r.total_amount), 0) as total_revenue
  from public.reservations r
  where r.establishment_id = p_establishment_id
    and r.status in ('checked_in','checked_out','confirmed')
    and r.created_at::date between p_start and p_end
  group by r.booking_mode
  order by r.booking_mode;
$$;

-- Triggers métiers
drop trigger if exists trg_reservations_room_status on public.reservations;
create trigger trg_reservations_room_status
after insert or update of status, room_id on public.reservations
for each row
execute function public.fn_update_room_status();

drop trigger if exists trg_reservations_client_stats on public.reservations;
create trigger trg_reservations_client_stats
after update of status on public.reservations
for each row
execute function public.fn_update_client_stats();

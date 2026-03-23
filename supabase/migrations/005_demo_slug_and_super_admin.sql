-- URL publique de démo + rôle Super Admin
-- Si `establishments.slug` n'existe pas (schéma incomplet), on la crée.

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'establishments'
      and column_name = 'slug'
  ) then
    alter table public.establishments add column slug varchar(180);
  end if;
end$$;

-- Slugs uniques pour les lignes encore vides
update public.establishments e
set slug = 'etab-' || substr(replace(e.id::text, '-', ''), 1, 16)
where e.slug is null or trim(e.slug) = '';

create unique index if not exists establishments_slug_unique_idx on public.establishments (slug);

-- Slug public de démo
update public.establishments
set slug = 'residence-angre-cocody'
where id = '22222222-2222-2222-2222-222222222221';

-- Enum du rôle : certaines bases n'ont pas la valeur super_admin (ex. type user_role vs user_role_enum)
do $$
declare
  tname text;
begin
  select c.udt_name::text
    into tname
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name = 'profiles'
    and c.column_name = 'role'
  limit 1;

  if tname is not null then
    execute format('alter type public.%I add value if not exists %L', tname, 'super_admin');
  end if;
end$$;

update public.profiles
set role = 'super_admin'
where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

drop policy if exists organizations_select_super_admin on public.organizations;
create policy organizations_select_super_admin on public.organizations
for select
to authenticated
using (public.current_user_role() = 'super_admin');

drop policy if exists establishments_select_super_admin on public.establishments;
create policy establishments_select_super_admin on public.establishments
for select
to authenticated
using (public.current_user_role() = 'super_admin');

-- URL publique de démo + rôle Super Admin pour le compte seed admin

update public.establishments
set slug = 'residence-angre-cocody'
where id = '22222222-2222-2222-2222-222222222221';

update public.profiles
set role = 'super_admin'
where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Super Admin : lecture globale des organisations et établissements (complète les policies existantes)
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

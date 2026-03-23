-- Connexion email/mot de passe : GoTrue exige une ligne dans auth.identities pour le provider "email".
-- Les seeds SQL qui insèrent seulement auth.users ne permettent pas signInWithPassword sans cette étape.

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
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
    select 1
    from auth.identities i
    where i.user_id = u.id
      and i.provider = 'email'
  );

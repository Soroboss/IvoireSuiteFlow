-- =============================================================================
-- InsForge : promouvoir un utilisateur existant en Super Admin
-- =============================================================================
-- Prérequis : tu t'es déjà inscrit via l’app (table `profiles` créée avec ton email).
--
-- Où l’exécuter : Dashboard InsForge → SQL / Query (ou outil SQL de ton projet).
--
-- 1) Remplace l’email ci-dessous par celui de TON compte (même que la connexion).
-- 2) Exécute tout le script.
-- 3) Déconnecte-toi / reconnecte-toi puis teste /admin ou GET /api/admin/saas.
-- =============================================================================

-- Ajoute la valeur d’enum si ton schéma utilise un type PostgreSQL pour `role`
DO $$
DECLARE
  tname text;
BEGIN
  SELECT c.udt_name::text
  INTO tname
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'profiles'
    AND c.column_name = 'role'
  LIMIT 1;

  IF tname IS NOT NULL THEN
    EXECUTE format('ALTER TYPE public.%I ADD VALUE IF NOT EXISTS %L', tname, 'super_admin');
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END$$;

-- >>>>>>>>>>>>> MODIFIE CETTE ADRESSE <<<<<<<<<<<
UPDATE public.profiles
SET role = 'super_admin'
WHERE lower(trim(coalesce(email, ''))) = lower(trim('remplacer@ton-email.com'));

-- Vérification : tu dois voir au moins une ligne
SELECT id, email, full_name, role
FROM public.profiles
WHERE role = 'super_admin';

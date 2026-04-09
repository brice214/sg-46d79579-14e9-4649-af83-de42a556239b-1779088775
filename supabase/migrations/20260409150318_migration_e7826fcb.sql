-- Supprimer temporairement la contrainte FK
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;
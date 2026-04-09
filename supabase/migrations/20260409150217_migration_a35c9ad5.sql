-- Supprimer complètement la contrainte FK problématique
ALTER TABLE public.profiles
DROP CONSTRAINT profiles_id_fkey CASCADE;
-- Supprimer la mauvaise contrainte FK
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;
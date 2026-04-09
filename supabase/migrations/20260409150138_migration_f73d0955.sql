-- Supprimer TOUTES les contraintes FK sur la colonne id de profiles
DO $$
DECLARE
  constraint_rec RECORD;
BEGIN
  FOR constraint_rec IN 
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE rel.relname = 'profiles'
      AND nsp.nspname = 'public'
      AND con.contype = 'f'
  LOOP
    EXECUTE 'ALTER TABLE profiles DROP CONSTRAINT IF EXISTS ' || constraint_rec.conname || ' CASCADE';
  END LOOP;
END $$;
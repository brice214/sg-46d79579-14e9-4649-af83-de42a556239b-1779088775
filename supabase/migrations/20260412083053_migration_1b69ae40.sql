-- Supprimer toutes les policies existantes sur storage.objects pour les documents
DROP POLICY IF EXISTS "Authors can upload own documents" ON storage.objects;
DROP POLICY IF EXISTS "Authors can update own documents" ON storage.objects;
DROP POLICY IF EXISTS "Authors can delete own documents" ON storage.objects;
DROP POLICY IF EXISTS "Public can view documents" ON storage.objects;

-- Créer des policies simplifiées et plus robustes
-- 1. INSERT: Auteurs peuvent uploader dans pdfs/{user_id}/ ou covers/{user_id}/
CREATE POLICY "Authors upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (
    name LIKE 'pdfs/' || auth.uid()::text || '/%'
    OR name LIKE 'covers/' || auth.uid()::text || '/%'
  )
);

-- 2. SELECT: Lecture publique de tous les documents
CREATE POLICY "Public read documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');

-- 3. UPDATE: Auteurs peuvent modifier leurs propres fichiers
CREATE POLICY "Authors update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    name LIKE 'pdfs/' || auth.uid()::text || '/%'
    OR name LIKE 'covers/' || auth.uid()::text || '/%'
  )
);

-- 4. DELETE: Auteurs peuvent supprimer leurs propres fichiers
CREATE POLICY "Authors delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    name LIKE 'pdfs/' || auth.uid()::text || '/%'
    OR name LIKE 'covers/' || auth.uid()::text || '/%'
  )
);
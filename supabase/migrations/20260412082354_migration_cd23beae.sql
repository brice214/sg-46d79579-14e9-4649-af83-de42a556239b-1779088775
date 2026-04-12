-- Supprimer les policies en double et incohérentes
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;

-- Créer une policy UPDATE cohérente pour les auteurs
CREATE POLICY "Authors can update own documents" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = ANY (ARRAY['pdfs', 'covers'])
  AND (storage.foldername(name))[2] = auth.uid()::text
);
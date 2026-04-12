-- Créer les policies RLS pour permettre aux auteurs d'uploader dans leur dossier
-- Policy 1: Les auteurs peuvent uploader dans leur propre dossier (pdfs/user_id/ ou covers/user_id/)
CREATE POLICY "Authors can upload own documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND auth.uid()::text = (string_to_array(name, '/'))[2]
  AND (
    name LIKE 'pdfs/' || auth.uid()::text || '/%'
    OR name LIKE 'covers/' || auth.uid()::text || '/%'
  )
);

-- Policy 2: Les auteurs peuvent modifier leurs propres fichiers
CREATE POLICY "Authors can update own documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (string_to_array(name, '/'))[2]
);

-- Policy 3: Les auteurs peuvent supprimer leurs propres fichiers
CREATE POLICY "Authors can delete own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (string_to_array(name, '/'))[2]
);

-- Policy 4: Tout le monde peut lire les fichiers publics
CREATE POLICY "Public can view documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'documents');
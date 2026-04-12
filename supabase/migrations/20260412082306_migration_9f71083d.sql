-- Supprimer l'ancienne policy incorrecte
DROP POLICY IF EXISTS "Authors can upload documents" ON storage.objects;

-- Créer une nouvelle policy qui vérifie que l'auteur uploade dans son propre dossier
CREATE POLICY "Authors can upload own documents" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = ANY (ARRAY['pdfs', 'covers'])
  AND (storage.foldername(name))[2] = auth.uid()::text
);
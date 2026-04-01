-- Créer les politiques de stockage pour le bucket documents
-- Permettre aux auteurs authentifiés d'uploader des fichiers
CREATE POLICY "Authors can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] IN ('pdfs', 'covers')
);

-- Permettre la lecture publique des documents approuvés
CREATE POLICY "Public can view documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');

-- Permettre aux auteurs de supprimer leurs propres fichiers
CREATE POLICY "Authors can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] IN ('pdfs', 'covers')
  AND auth.uid()::text = (storage.foldername(name))[2]
);
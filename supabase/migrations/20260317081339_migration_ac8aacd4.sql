-- Créer le bucket de stockage pour les documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Politique de stockage : tout le monde peut lire les documents
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

-- Politique de stockage : utilisateurs authentifiés peuvent uploader
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' 
    AND auth.uid() IS NOT NULL
  );

-- Politique de stockage : les utilisateurs peuvent modifier leurs propres fichiers
CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Politique de stockage : les utilisateurs peuvent supprimer leurs propres fichiers
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
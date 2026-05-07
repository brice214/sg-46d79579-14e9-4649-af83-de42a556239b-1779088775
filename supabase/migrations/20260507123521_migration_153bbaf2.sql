-- Créer les policies RLS manquantes pour la table purchases
-- Actuellement il n'y a qu'une policy SELECT

-- Policy INSERT: Les utilisateurs authentifiés peuvent créer leurs propres achats
CREATE POLICY "Users can create their own purchases" ON purchases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy pour permettre au service role de créer des achats (callback eBilling)
-- Note: Le service role bypass RLS donc cette policy est documentative
CREATE POLICY "Service role can create purchases" ON purchases
  FOR INSERT
  WITH CHECK (true);
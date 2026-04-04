-- ÉTAPE 1 : Migration - Table ebilling_transactions pour AFRILITT
CREATE TABLE IF NOT EXISTS ebilling_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relations AFRILITT
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  
  -- Identifiants de transaction
  reference TEXT NOT NULL UNIQUE,
  ebilling_id TEXT,
  transaction_id TEXT,
  
  -- Informations de paiement
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'created',
  operator TEXT,
  
  -- Informations client
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  
  -- Métadonnées
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  
  CONSTRAINT unique_reference UNIQUE(reference)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_ebilling_user ON ebilling_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ebilling_document ON ebilling_transactions(document_id);
CREATE INDEX IF NOT EXISTS idx_ebilling_status ON ebilling_transactions(status);
CREATE INDEX IF NOT EXISTS idx_ebilling_reference ON ebilling_transactions(reference);
CREATE INDEX IF NOT EXISTS idx_ebilling_id ON ebilling_transactions(ebilling_id);

-- RLS (Row Level Security)
ALTER TABLE ebilling_transactions ENABLE ROW LEVEL SECURITY;

-- Policy : lecture pour l'utilisateur propriétaire
CREATE POLICY "Users can view own transactions"
  ON ebilling_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy : création pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can create transactions"
  ON ebilling_transactions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_ebilling_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ebilling_updated_at_trigger ON ebilling_transactions;
CREATE TRIGGER ebilling_updated_at_trigger
  BEFORE UPDATE ON ebilling_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_ebilling_updated_at();
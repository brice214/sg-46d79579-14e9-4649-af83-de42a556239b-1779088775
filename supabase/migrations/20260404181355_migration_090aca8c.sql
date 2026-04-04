-- Rendre user_id nullable car les achats peuvent être faits sans connexion
ALTER TABLE ebilling_transactions 
ALTER COLUMN user_id DROP NOT NULL;

-- Ajouter un index pour rechercher par user_id (pour les utilisateurs connectés)
CREATE INDEX IF NOT EXISTS idx_ebilling_transactions_user_id 
ON ebilling_transactions(user_id) 
WHERE user_id IS NOT NULL;

-- Ajouter client_address qui manque aussi
ALTER TABLE ebilling_transactions 
ADD COLUMN IF NOT EXISTS client_address TEXT;

-- Ajouter short_description qui manque
ALTER TABLE ebilling_transactions 
ADD COLUMN IF NOT EXISTS short_description TEXT;
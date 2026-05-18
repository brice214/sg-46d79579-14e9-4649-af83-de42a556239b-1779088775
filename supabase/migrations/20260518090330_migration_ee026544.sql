-- Ajouter le champ promo_price à la table documents
ALTER TABLE documents 
ADD COLUMN promo_price numeric(10,2) DEFAULT NULL;

-- Ajouter une contrainte pour s'assurer que le prix promo est positif ou null
ALTER TABLE documents
ADD CONSTRAINT documents_promo_price_check CHECK (promo_price IS NULL OR promo_price >= 0);

COMMENT ON COLUMN documents.promo_price IS 'Prix promotionnel facultatif. Si défini, c''est ce prix qui est utilisé lors du paiement.';
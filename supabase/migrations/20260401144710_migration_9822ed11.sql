-- Ajout des colonnes manquantes pour les analytics et les bannières
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS commission_amount numeric DEFAULT 0;
ALTER TABLE homepage_banners ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

-- Update existing transactions to have a default commission of 15%
UPDATE transactions SET commission_amount = amount * 0.15 WHERE commission_amount = 0 OR commission_amount IS NULL;
-- Table de configuration de la plateforme
CREATE TABLE IF NOT EXISTS platform_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  category text NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Table pour les bannières homepage
CREATE TABLE IF NOT EXISTS homepage_banners (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  subtitle text,
  image_url text,
  cta_text text,
  cta_link text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Ajouter display_order à la table categories si elle n'existe pas
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- RLS pour platform_settings
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_settings" ON platform_settings
  FOR SELECT USING (true);

CREATE POLICY "admin_manage_settings" ON platform_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS pour homepage_banners
ALTER TABLE homepage_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_banners" ON homepage_banners
  FOR SELECT USING (is_active = true);

CREATE POLICY "admin_manage_banners" ON homepage_banners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Insertion des paramètres par défaut avec JSON valide
INSERT INTO platform_settings (key, value, description, category) VALUES
  -- Configuration paiement
  ('commission_rate', '{"value": 15}'::jsonb, 'Taux de commission de la plateforme (%)', 'payment'),
  ('enable_mobile_money', '{"value": true}'::jsonb, 'Activer Mobile Money', 'payment'),
  ('enable_card_payment', '{"value": true}'::jsonb, 'Activer paiement carte bancaire', 'payment'),
  ('min_payout_amount', '{"value": 5000}'::jsonb, 'Montant minimum de retrait (XOF)', 'payment'),
  
  -- Configuration email
  ('admin_email', '{"value": "admin@afrilitt.com"}'::jsonb, 'Email administrateur principal', 'email'),
  ('notification_new_document', '{"value": true}'::jsonb, 'Notifier admin nouveaux documents', 'email'),
  ('notification_new_report', '{"value": true}'::jsonb, 'Notifier admin nouveaux signalements', 'email'),
  
  -- Configuration légale
  ('terms_of_service', '{"value": "CGU à rédiger..."}'::jsonb, 'Conditions générales d''utilisation', 'legal'),
  ('privacy_policy', '{"value": "Politique de confidentialité à rédiger..."}'::jsonb, 'Politique de confidentialité', 'legal'),
  
  -- Branding
  ('site_logo', '{"value": "/afrilitt-logo.png"}'::jsonb, 'URL du logo de la plateforme', 'branding'),
  ('primary_color', '{"value": "#C4865C"}'::jsonb, 'Couleur principale (ocre)', 'branding'),
  ('secondary_color', '{"value": "#D4AF37"}'::jsonb, 'Couleur secondaire (or)', 'branding'),
  ('accent_color', '{"value": "#2D5016"}'::jsonb, 'Couleur d''accent (vert forêt)', 'branding'),
  
  -- Textes marketing
  ('hero_title', '{"value": "La Bibliothèque Africaine du Savoir"}'::jsonb, 'Titre hero homepage', 'marketing'),
  ('hero_subtitle', '{"value": "Publiez, partagez et monétisez vos connaissances"}'::jsonb, 'Sous-titre hero', 'marketing'),
  ('about_short', '{"value": "AfriLitt est la première plateforme panafricaine de publication et de vente de documents numériques."}'::jsonb, 'Description courte', 'marketing')
ON CONFLICT (key) DO NOTHING;

-- Insertion bannières par défaut
INSERT INTO homepage_banners (title, subtitle, image_url, cta_text, cta_link, display_order) VALUES
  ('Bienvenue sur AfriLitt', 'La plateforme africaine de publication du savoir', '/afrilitt-background.jpg', 'Explorer le catalogue', '/catalogue', 1),
  ('Devenez Auteur', 'Partagez vos connaissances et générez des revenus', '/afrilitt-background.jpg', 'Commencer à publier', '/upload', 2)
ON CONFLICT DO NOTHING;
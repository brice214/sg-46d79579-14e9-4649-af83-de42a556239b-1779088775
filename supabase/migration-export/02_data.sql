-- AFRILITT Data Migration Script
-- Generated: 2026-04-09
-- Import existing data from old project to new project

-- ============================================
-- IMPORTANT: Run 01_schema.sql FIRST before this file
-- ============================================

-- ============================================
-- STEP 1: Insert Categories
-- ============================================

INSERT INTO public.categories (id, name, slug, description, icon, created_at, display_order, is_active) VALUES
('40c8b829-d567-48a3-b255-a69ac2a91084', 'Sciences', 'sciences', 'Recherches scientifiques et techniques', '🔬', '2026-03-17 08:06:16.183044+00', 0, true),
('86cee954-2969-4ee4-9e7d-49e70eb54847', 'Droit', 'droit', 'Droit et sciences juridiques', '⚖️', '2026-03-17 08:06:16.183044+00', 0, true),
('7de11811-564d-4a68-a567-7ef0befdd3a4', 'Économie', 'economie', 'Économie et développement', '📊', '2026-03-17 08:06:16.183044+00', 0, true),
('a2badd6e-e162-40c8-afec-cde6b7e30cec', 'Éducation', 'education', 'Manuels scolaires et pédagogie', '🎓', '2026-03-17 08:06:16.183044+00', 0, true),
('048c5cfa-9a6a-4405-8aa1-93607b36d4a0', 'Histoire', 'histoire', 'Histoire africaine et mondiale', '🕐', '2026-03-17 08:06:16.183044+00', 0, true),
('3a1ff03a-7f26-488d-8323-ee69b24acbea', 'Littérature', 'litterature', 'Romans, nouvelles, poésie africaine', '📖', '2026-03-17 08:06:16.183044+00', 0, true),
('f2a1080b-3998-411e-b07b-bd69e6a03fb3', 'Philosophie', 'philosophie', 'Pensée et philosophie africaine', '🧠', '2026-03-17 08:06:16.183044+00', 0, true),
('635978ef-a47b-4982-b51e-98fa71d4b249', 'Santé', 'sante', 'Médecine et santé publique', '❤️', '2026-03-17 08:06:16.183044+00', 0, true),
('01c5eaec-5a6b-41c4-8b44-6a1ff8ffd396', 'Affaires', 'affaires', 'Entrepreneuriat, gestion, économie et développement des entreprises africaines.', '💼', '2026-04-01 13:01:40.57652+00', 0, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 2: Insert Profiles
-- ============================================
-- NOTE: Vous devrez recréer les utilisateurs dans Supabase Auth UI
-- et mettre à jour les IDs ci-dessous avec les nouveaux IDs générés

-- Admin: admin@afrilitt.com (à créer manuellement dans Auth)
-- Auteur: bantoo1reseau@gmail.com (à créer manuellement dans Auth)
-- Lecteur: goodchoice.gabon@gmail.com (à créer manuellement dans Auth)

-- Après avoir créé les utilisateurs dans Auth, récupérez leurs nouveaux IDs
-- et exécutez ces commandes avec les bons IDs:

-- INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at) VALUES
-- ('NOUVEAU_ID_ADMIN', 'admin@afrilitt.com', 'Administrateur AfriLitt', 'admin', NOW(), NOW()),
-- ('NOUVEAU_ID_AUTEUR', 'bantoo1reseau@gmail.com', 'Auetur 1', 'author', NOW(), NOW()),
-- ('NOUVEAU_ID_LECTEUR', 'goodchoice.gabon@gmail.com', 'Lecteur 1', 'visitor', NOW(), NOW());

-- ============================================
-- STEP 3: Insert Homepage Banners
-- ============================================

INSERT INTO public.homepage_banners (id, title, subtitle, image_url, cta_text, cta_link, display_order, is_active, created_at, updated_at) VALUES
('09c2d0ed-397d-4d28-8878-b24b28b86e44', 'Bienvenue sur AfriLitt', 'La plateforme africaine de publication du savoir', '/afrilitt-background.jpg', 'Explorer le catalogue', '/catalogue', 1, true, '2026-04-01 14:44:30.774882+00', '2026-04-01 14:47:10.087455+00'),
('8f98c43c-557a-4828-a4e2-317555127c4a', 'Devenez Auteur', 'Partagez vos connaissances et générez des revenus', '/afrilitt-background.jpg', 'Commencer à publier', '/upload', 2, true, '2026-04-01 14:44:30.774882+00', '2026-04-01 14:47:10.087455+00')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 4: Insert Platform Settings
-- ============================================

INSERT INTO public.platform_settings (id, key, value, description, category, created_at, updated_at) VALUES
-- Branding
('5004b2f6-4baf-4c67-87f8-10062b54bb53', 'accent_color', '{"value": "#2D5016"}', 'Couleur d''accent (vert forêt)', 'branding', '2026-04-01 14:47:10.087455+00', '2026-04-01 14:44:30.774882+00'),
('821fb7d1-bc95-4314-884e-3c6461c1d7d7', 'primary_color', '{"value": "#C4865C"}', 'Couleur principale (ocre)', 'branding', '2026-04-01 14:47:10.087455+00', '2026-04-04 13:06:49.446+00'),
('40a85253-9354-49f2-be8e-0ec98a625a9f', 'secondary_color', '{"value": "#D4AF37"}', 'Couleur secondaire (or)', 'branding', '2026-04-01 14:47:10.087455+00', '2026-04-01 14:44:30.774882+00'),
('213ccc53-0ab1-4081-a784-d20a8bab86a3', 'site_logo', '{"value": "/afrilitt-logo.png"}', 'URL du logo de la plateforme', 'branding', '2026-04-01 14:47:10.087455+00', '2026-04-01 14:44:30.774882+00'),

-- Email
('957ea208-863d-4900-acc0-ba12ba1878a6', 'admin_email', '{"value": "admin@afrilitt.com"}', 'Email administrateur principal', 'email', '2026-04-01 14:47:10.087455+00', '2026-04-01 14:44:30.774882+00'),
('02102500-2576-4757-adf7-b5b862968d1c', 'notification_new_document', '{"value": true}', 'Notifier admin nouveaux documents', 'email', '2026-04-01 14:47:10.087455+00', '2026-04-01 14:44:30.774882+00'),
('d6acfda4-6062-41ad-b2c5-233104874869', 'notification_new_report', '{"value": true}', 'Notifier admin nouveaux signalements', 'email', '2026-04-01 14:47:10.087455+00', '2026-04-01 14:44:30.774882+00'),

-- Legal
('ad8f443f-1ca6-4f8e-b653-4e63488737f8', 'privacy_policy', '{"value": "Politique de confidentialité à rédiger..."}', 'Politique de confidentialité', 'legal', '2026-04-01 14:47:10.087455+00', '2026-04-04 13:06:49.446+00'),
('58d23be1-a34a-45cc-a633-41f5d73dc407', 'terms_of_service', '{"value": "CGU à rédiger..."}', 'Conditions générales d''utilisation', 'legal', '2026-04-01 14:47:10.087455+00', '2026-04-04 13:06:49.446+00'),

-- Marketing
('f498bcf1-c99d-4269-a62b-7b1c1f2b3a36', 'about_short', '{"value": "AfriLitt est la première plateforme panafricaine de publication et de vente de documents numériques."}', 'Description courte', 'marketing', '2026-04-01 14:47:10.087455+00', '2026-04-01 14:44:30.774882+00'),
('11346da4-c247-4f3a-991d-d046ad195527', 'hero_subtitle', '{"value": "Publiez, partagez et monétisez vos connaissances"}', 'Sous-titre hero', 'marketing', '2026-04-01 14:47:10.087455+00', '2026-04-01 14:44:30.774882+00'),
('f839b738-8b86-4f33-81ea-33e19270ae98', 'hero_title', '{"value": "La Bibliothèque Africaine du Savoir"}', 'Titre hero homepage', 'marketing', '2026-04-01 14:47:10.087455+00', '2026-04-01 14:44:30.774882+00'),

-- Payment
('dc38f348-c849-4cb0-9bcf-a63fb6bfd16a', 'commission_rate', '10', 'Taux de commission de la plateforme (%)', 'payment', '2026-04-01 14:47:10.087455+00', '2026-04-04 13:06:49.443+00'),
('d5cf7219-d2f7-4c2a-bdca-25cdf1002b29', 'ebilling_mode', '"LAB"', 'Mode environnement eBilling (LAB ou PROD)', 'payment', '2026-04-04 13:03:34.796247+00', '2026-04-04 13:06:49.449+00'),
('0f1166e2-8549-4202-a859-abe190ce2bb0', 'ebilling_sharedkey', '"165aeba1-8544-43cc-9ef3-50f01d754f7b"', 'Clé partagée eBilling', 'payment', '2026-04-04 13:03:34.796247+00', '2026-04-04 13:06:49.448+00'),
('c428bb69-1c18-4557-8a99-572b83294d6f', 'ebilling_username', '"afrilitt"', 'Nom d''utilisateur eBilling', 'payment', '2026-04-04 13:03:34.796247+00', '2026-04-04 13:06:49.448+00'),
('4c2e97e3-55ac-46ee-8bd2-f654e95fbfbf', 'enable_card_payment', '{"value": true}', 'Activer paiement carte bancaire', 'payment', '2026-04-01 14:47:10.087455+00', '2026-04-01 14:44:30.774882+00'),
('5a4b4565-f33a-42ba-89fa-33591a22baaf', 'enable_mobile_money', '{"value": true}', 'Activer Mobile Money', 'payment', '2026-04-01 14:47:10.087455+00', '2026-04-01 14:44:30.774882+00'),
('96369c07-9374-4a28-8053-5af70c47993a', 'min_payout_amount', '{"value": 5000}', 'Montant minimum de retrait (XOF)', 'payment', '2026-04-01 14:47:10.087455+00', '2026-04-01 14:44:30.774882+00'),

-- Withdrawals
('e0faf458-5924-46ad-92f0-77b16fd71f41', 'withdrawal_methods', '{"mobile_money": true, "bank_transfer": true}', 'Méthodes de retrait disponibles', 'withdrawals', '2026-04-01 16:00:57.439933+00', '2026-04-01 16:00:57.439933+00'),
('6958bf86-60f3-4b31-b1d5-97870ef56f7c', 'withdrawal_minimum_amount', '{"amount": 10000, "currency": "XOF"}', 'Montant minimum pour effectuer un retrait', 'withdrawals', '2026-04-01 16:00:57.439933+00', '2026-04-01 16:00:57.439933+00'),
('02107aa3-ea94-440d-a6ff-aeb236c18f65', 'withdrawal_transaction_fee', '{"type": "percentage", "value": 2.5, "minimum": 500}', 'Frais de transaction pour les retraits (pourcentage ou montant fixe)', 'withdrawals', '2026-04-01 16:00:57.439933+00', '2026-04-01 16:00:57.439933+00')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 5: Documents (Manual Migration Required)
-- ============================================

-- IMPORTANT: Les documents contiennent des fichiers stockés dans Supabase Storage
-- Vous devrez migrer manuellement les fichiers du bucket "documents" vers le nouveau projet
-- Ensuite, mettez à jour les URLs dans les commandes ci-dessous

-- Documents existants (à migrer après avoir transféré les fichiers):
-- 1. "Code d'intégration mobile 1" - ID: dcf3e626-2165-4326-8e92-adf8e6736ee2
-- 2. "Manuel d'intégration de paiement mobile" - ID: cc315a3d-f70b-44fa-8e15-1c72cf63ec77

-- ============================================
-- DATA MIGRATION COMPLETE
-- ============================================

-- NEXT STEPS:
-- 1. Créer les utilisateurs dans Supabase Auth UI
-- 2. Mettre à jour les IDs dans STEP 2
-- 3. Migrer les fichiers du bucket Storage "documents"
-- 4. Importer les documents avec les nouvelles URLs
-- 5. Mettre à jour .env.local avec les nouvelles clés
-- 6. Tester l'application
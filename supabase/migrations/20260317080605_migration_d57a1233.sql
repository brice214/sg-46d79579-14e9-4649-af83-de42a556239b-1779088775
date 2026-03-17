ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'visitor' CHECK (role IN ('visitor', 'author', 'admin'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  keywords TEXT[],
  document_type TEXT NOT NULL CHECK (document_type IN ('article', 'memoire', 'these', 'roman', 'essai', 'manuel', 'recherche', 'autre')),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  currency TEXT DEFAULT 'XOF',
  page_count INTEGER,
  file_url TEXT NOT NULL,
  preview_url TEXT,
  cover_image_url TEXT,
  file_size_bytes BIGINT,
  is_certified BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'XOF',
  platform_fee DECIMAL(10, 2) NOT NULL,
  author_earnings DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mobile_money', 'card', 'free')),
  payment_provider TEXT,
  transaction_reference TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('copyright', 'inappropriate', 'spam', 'misleading', 'autre')),
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  access_granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(document_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_documents_author ON documents(author_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category_id);
CREATE INDEX IF NOT EXISTS idx_documents_published ON documents(is_published, is_approved);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_author ON transactions(author_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_document ON purchases(document_id);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
-- AFRILITT Database Migration Script
-- Generated: 2026-04-09
-- Source: Old Supabase Project
-- Target: New Supabase Project (pvjeufrrktatorurgstl)

-- ============================================
-- STEP 1: Enable Required Extensions
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 2: Create Tables
-- ============================================

-- Table: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    role text DEFAULT 'visitor'::text,
    bio text,
    country text,
    CONSTRAINT profiles_role_check CHECK (role IN ('visitor', 'author', 'admin'))
);

-- Table: categories
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    description text,
    icon text,
    created_at timestamp with time zone DEFAULT now(),
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true
);

-- Table: documents
CREATE TABLE IF NOT EXISTS public.documents (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    description text NOT NULL,
    author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    keywords text[],
    document_type text NOT NULL,
    price numeric(10,2) NOT NULL DEFAULT 0,
    currency text DEFAULT 'XOF'::text,
    page_count integer,
    file_url text NOT NULL,
    preview_url text,
    cover_image_url text,
    file_size_bytes bigint,
    is_certified boolean DEFAULT false,
    is_published boolean DEFAULT false,
    is_approved boolean DEFAULT false,
    download_count integer DEFAULT 0,
    view_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    published_at timestamp with time zone,
    CONSTRAINT documents_document_type_check CHECK (document_type IN ('article', 'memoire', 'these', 'roman', 'essai', 'manuel', 'recherche', 'autre')),
    CONSTRAINT documents_price_check CHECK (price >= 0)
);

-- Table: transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    buyer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'XOF'::text,
    platform_fee numeric(10,2) NOT NULL,
    author_earnings numeric(10,2) NOT NULL,
    payment_method text NOT NULL,
    payment_provider text,
    transaction_reference text UNIQUE,
    status text NOT NULL DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    commission_amount numeric DEFAULT 0,
    CONSTRAINT transactions_payment_method_check CHECK (payment_method IN ('mobile_money', 'card', 'free')),
    CONSTRAINT transactions_status_check CHECK (status IN ('pending', 'completed', 'failed', 'refunded'))
);

-- Table: purchases
CREATE TABLE IF NOT EXISTS public.purchases (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    transaction_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL,
    access_granted_at timestamp with time zone DEFAULT now(),
    download_count integer DEFAULT 0,
    last_downloaded_at timestamp with time zone,
    CONSTRAINT purchases_document_id_user_id_key UNIQUE (document_id, user_id)
);

-- Table: reports
CREATE TABLE IF NOT EXISTS public.reports (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason text NOT NULL,
    details text NOT NULL,
    status text NOT NULL DEFAULT 'pending'::text,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now(),
    resolved_at timestamp with time zone,
    CONSTRAINT reports_reason_check CHECK (reason IN ('copyright', 'inappropriate', 'spam', 'misleading', 'autre')),
    CONSTRAINT reports_status_check CHECK (status IN ('pending', 'reviewed', 'resolved', 'rejected'))
);

-- Table: homepage_banners
CREATE TABLE IF NOT EXISTS public.homepage_banners (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    subtitle text,
    image_url text,
    cta_text text,
    cta_link text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Table: platform_settings
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    key text NOT NULL UNIQUE,
    value jsonb NOT NULL,
    description text,
    category text NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- Table: withdrawal_requests
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount numeric(10,2) NOT NULL,
    transaction_fee numeric(10,2) NOT NULL DEFAULT 0,
    net_amount numeric(10,2) NOT NULL,
    payment_method text NOT NULL,
    payment_details jsonb NOT NULL DEFAULT '{}'::jsonb,
    status text NOT NULL DEFAULT 'pending'::text,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now(),
    processed_at timestamp with time zone,
    processed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    transaction_reference text UNIQUE,
    CONSTRAINT withdrawal_requests_amount_check CHECK (amount > 0),
    CONSTRAINT withdrawal_requests_net_amount_check CHECK (net_amount > 0),
    CONSTRAINT withdrawal_requests_payment_method_check CHECK (payment_method IN ('mobile_money', 'bank_transfer')),
    CONSTRAINT withdrawal_requests_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'completed'))
);

-- Table: ebilling_transactions
CREATE TABLE IF NOT EXISTS public.ebilling_transactions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    reference text NOT NULL UNIQUE,
    ebilling_id text,
    transaction_id text,
    amount numeric(10,2) NOT NULL,
    status text NOT NULL DEFAULT 'created'::text,
    operator text,
    client_name text NOT NULL,
    client_email text NOT NULL,
    client_phone text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    paid_at timestamp with time zone,
    client_address text,
    short_description text
);

-- ============================================
-- STEP 3: Create Indexes
-- ============================================

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_author ON public.documents(author_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category_id);
CREATE INDEX IF NOT EXISTS idx_documents_published ON public.documents(is_published, is_approved);

-- Purchases indexes
CREATE INDEX IF NOT EXISTS idx_purchases_document ON public.purchases(document_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON public.purchases(user_id);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_author ON public.transactions(author_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON public.transactions(buyer_id);

-- Withdrawal requests indexes
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_author ON public.withdrawal_requests(author_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON public.withdrawal_requests(created_at DESC);

-- Ebilling transactions indexes
CREATE INDEX IF NOT EXISTS idx_ebilling_reference ON public.ebilling_transactions(reference);
CREATE INDEX IF NOT EXISTS idx_ebilling_id ON public.ebilling_transactions(ebilling_id);
CREATE INDEX IF NOT EXISTS idx_ebilling_status ON public.ebilling_transactions(status);
CREATE INDEX IF NOT EXISTS idx_ebilling_user ON public.ebilling_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ebilling_document ON public.ebilling_transactions(document_id);
CREATE INDEX IF NOT EXISTS idx_ebilling_transactions_user_id ON public.ebilling_transactions(user_id);

-- ============================================
-- STEP 4: Enable Row Level Security
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ebilling_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: Create RLS Policies
-- ============================================

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update profiles" ON public.profiles
    FOR UPDATE USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Categories policies
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

-- Documents policies
CREATE POLICY "Anyone can view published documents" ON public.documents
    FOR SELECT USING (is_published = true AND is_approved = true);

CREATE POLICY "Authors can view own documents" ON public.documents
    FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Admins can view all documents" ON public.documents
    FOR SELECT USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Authors can insert documents" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own documents" ON public.documents
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Admins can update documents" ON public.documents
    FOR UPDATE USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Admins can delete documents" ON public.documents
    FOR DELETE USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Transactions policies
CREATE POLICY "Users can view own purchases" ON public.transactions
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = author_id);

CREATE POLICY "Admins can view all transactions" ON public.transactions
    FOR SELECT USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Purchases policies
CREATE POLICY "Users can view own purchases table" ON public.purchases
    FOR SELECT USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can report documents" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports" ON public.reports
    FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports" ON public.reports
    FOR SELECT USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Admins can update reports" ON public.reports
    FOR UPDATE USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Homepage banners policies
CREATE POLICY "public_read_banners" ON public.homepage_banners
    FOR SELECT USING (is_active = true);

CREATE POLICY "admin_manage_banners" ON public.homepage_banners
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Platform settings policies
CREATE POLICY "public_read_settings" ON public.platform_settings
    FOR SELECT USING (true);

CREATE POLICY "admin_manage_settings" ON public.platform_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Withdrawal requests policies
CREATE POLICY "authors_view_own_withdrawals" ON public.withdrawal_requests
    FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "admins_view_all_withdrawals" ON public.withdrawal_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "authors_create_withdrawals" ON public.withdrawal_requests
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "admins_update_withdrawals" ON public.withdrawal_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Ebilling transactions policies
CREATE POLICY "Authenticated users can create transactions" ON public.ebilling_transactions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own transactions" ON public.ebilling_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- STEP 6: Create Trigger for Auto Profile Creation
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next step: Run 02_data.sql to import existing data
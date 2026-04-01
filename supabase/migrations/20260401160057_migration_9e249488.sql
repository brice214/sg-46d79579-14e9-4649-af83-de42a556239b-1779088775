-- Create withdrawal_requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  transaction_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(10,2) NOT NULL CHECK (net_amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mobile_money', 'bank_transfer')),
  payment_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  transaction_reference TEXT UNIQUE
);

-- Create indexes for better performance
CREATE INDEX idx_withdrawal_requests_author ON withdrawal_requests(author_id);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX idx_withdrawal_requests_created_at ON withdrawal_requests(created_at DESC);

-- Enable RLS
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Authors can view their own withdrawal requests
CREATE POLICY "authors_view_own_withdrawals" ON withdrawal_requests
  FOR SELECT
  USING (auth.uid() = author_id);

-- Authors can create withdrawal requests
CREATE POLICY "authors_create_withdrawals" ON withdrawal_requests
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Admins can view all withdrawal requests
CREATE POLICY "admins_view_all_withdrawals" ON withdrawal_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update withdrawal requests
CREATE POLICY "admins_update_withdrawals" ON withdrawal_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default withdrawal settings
INSERT INTO platform_settings (key, value, description, category)
VALUES 
  ('withdrawal_minimum_amount', '{"amount": 10000, "currency": "XOF"}'::jsonb, 'Montant minimum pour effectuer un retrait', 'withdrawals'),
  ('withdrawal_transaction_fee', '{"type": "percentage", "value": 2.5, "minimum": 500}'::jsonb, 'Frais de transaction pour les retraits (pourcentage ou montant fixe)', 'withdrawals'),
  ('withdrawal_methods', '{"mobile_money": true, "bank_transfer": true}'::jsonb, 'Méthodes de retrait disponibles', 'withdrawals')
ON CONFLICT (key) DO NOTHING;
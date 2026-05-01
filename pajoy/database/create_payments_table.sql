-- PAJOY POS System - Payments Table
-- Created for Pesapal payment integration

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    invoice_id TEXT,
    merchant_reference TEXT UNIQUE NOT NULL,
    order_tracking_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'KES',
    customer_name TEXT,
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    payment_account TEXT,
    confirmation_code TEXT,
    redirect_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME,
    raw_response TEXT,
    FOREIGN KEY (invoice_id) REFERENCES sales(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_merchant_reference ON payments(merchant_reference);
CREATE INDEX IF NOT EXISTS idx_payments_order_tracking_id ON payments(order_tracking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);

-- Add payment_status column to sales table if it doesn't exist
ALTER TABLE sales ADD COLUMN payment_status TEXT DEFAULT 'pending';

-- Add paid_at column to sales table if it doesn't exist
ALTER TABLE sales ADD COLUMN paid_at DATETIME;

-- Create payment_logs table for audit trail
CREATE TABLE IF NOT EXISTS payment_logs (
    id TEXT PRIMARY KEY,
    payment_id TEXT,
    event_type TEXT NOT NULL,
    event_data TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

-- Create indexes for payment_logs
CREATE INDEX IF NOT EXISTS idx_payment_logs_payment_id ON payment_logs(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_event_type ON payment_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON payment_logs(created_at);

-- Create payment_attempts table for retry tracking
CREATE TABLE IF NOT EXISTS payment_attempts (
    id TEXT PRIMARY KEY,
    payment_id TEXT,
    attempt_number INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    attempt_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

-- Create indexes for payment_attempts
CREATE INDEX IF NOT EXISTS idx_payment_attempts_payment_id ON payment_attempts(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_status ON payment_attempts(status);

-- Insert sample payment methods for reference
INSERT OR IGNORE INTO payment_methods (code, name, description, is_active) VALUES
('MPESA', 'M-Pesa', 'Mobile money transfer service', 1),
('CARD', 'Credit/Debit Card', 'Visa/Mastercard payments', 1),
('BANK', 'Bank Transfer', 'Direct bank transfer', 1),
('WALLET', 'Mobile Wallet', 'Other mobile wallet services', 1);

-- Create payment_methods table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_methods (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create payment_settings table for configuration
CREATE TABLE IF NOT EXISTS payment_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    description TEXT,
    is_encrypted INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default payment settings
INSERT OR IGNORE INTO payment_settings (key, value, description) VALUES
('pesapal_enabled', 'true', 'Enable Pesapal payment gateway'),
('auto_print_receipt', 'true', 'Automatically print receipt on successful payment'),
('payment_timeout', '300', 'Payment timeout in seconds'),
('max_retry_attempts', '3', 'Maximum retry attempts for failed payments'),
('webhook_secret', '', 'Pesapal webhook secret for signature verification');

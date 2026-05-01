-- Create Pesapal transactions table for payment tracking
CREATE TABLE IF NOT EXISTS pesapal_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    merchant_request_id TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    order_id INTEGER,
    customer_name TEXT,
    email TEXT,
    status TEXT DEFAULT 'PENDING',
    pesapal_receipt TEXT,
    payment_method TEXT,
    payment_account TEXT,
    transaction_date TEXT,
    result_desc TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pesapal_merchant_request_id ON pesapal_transactions(merchant_request_id);
CREATE INDEX IF NOT EXISTS idx_pesapal_order_id ON pesapal_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_pesapal_status ON pesapal_transactions(status);
CREATE INDEX IF NOT EXISTS idx_pesapal_created_at ON pesapal_transactions(created_at);

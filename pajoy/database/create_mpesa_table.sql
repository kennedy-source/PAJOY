-- Create M-Pesa transactions table for payment tracking
CREATE TABLE IF NOT EXISTS mpesa_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_request_id TEXT UNIQUE NOT NULL,
  checkout_request_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  amount REAL NOT NULL,
  order_id INTEGER,
  customer_name TEXT,
  status TEXT DEFAULT 'PENDING',
  mpesa_receipt TEXT,
  result_desc TEXT,
  transaction_date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (order_id) REFERENCES sales(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mpesa_merchant_request ON mpesa_transactions(merchant_request_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_status ON mpesa_transactions(status);
CREATE INDEX IF NOT EXISTS idx_mpesa_order_id ON mpesa_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_created_at ON mpesa_transactions(created_at);

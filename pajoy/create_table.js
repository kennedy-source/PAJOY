const Database = require('better-sqlite3');
const db = new Database('./database/pajoy.db');

// Create Pesapal transactions table
const createTable = `
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
`;

try {
  db.exec(createTable);
  console.log('✅ pesapal_transactions table created successfully');
  
  // Create indexes
  db.exec('CREATE INDEX IF NOT EXISTS idx_pesapal_merchant_request_id ON pesapal_transactions(merchant_request_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_pesapal_order_id ON pesapal_transactions(order_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_pesapal_status ON pesapal_transactions(status)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_pesapal_created_at ON pesapal_transactions(created_at)');
  
  console.log('✅ Indexes created successfully');
  
  // Check if table exists
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='pesapal_transactions'").all();
  console.log('📊 Tables found:', tables.map(t => t.name));
  
} catch (error) {
  console.error('❌ Error creating table:', error.message);
} finally {
  db.close();
}

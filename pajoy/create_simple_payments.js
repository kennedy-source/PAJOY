const Database = require('better-sqlite3');
const db = new Database('./database/pajoy.db');

try {
  console.log('🔄 Creating simplified payment tables...');
  
  // Create payments table
  db.exec(`
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
      raw_response TEXT
    )
  `);

  // Create indexes
  db.exec('CREATE INDEX IF NOT EXISTS idx_payments_merchant_reference ON payments(merchant_reference)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_payments_order_tracking_id ON payments(order_tracking_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at)');

  // Add payment_status column to sales table if it doesn't exist
  try {
    db.exec('ALTER TABLE sales ADD COLUMN payment_status TEXT DEFAULT "pending"');
    console.log('✅ Added payment_status column to sales table');
  } catch (e) {
    // Column already exists, that's fine
  }

  // Add paid_at column to sales table if it doesn't exist
  try {
    db.exec('ALTER TABLE sales ADD COLUMN paid_at DATETIME');
    console.log('✅ Added paid_at column to sales table');
  } catch (e) {
    // Column already exists, that's fine
  }

  console.log('✅ Payment tables created successfully');

  // Test the callback endpoint by creating a sample payment
  const samplePayment = {
    id: 'test-payment-123',
    merchant_reference: 'TEST-123',
    order_tracking_id: 'test-order-456',
    amount: 100.00,
    currency: 'KES',
    customer_name: 'Test Customer',
    phone: '254712345678',
    email: 'test@example.com',
    status: 'pending'
  };

  db.prepare(`
    INSERT INTO payments (
      id, merchant_reference, order_tracking_id, amount, currency,
      customer_name, phone, email, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    samplePayment.id,
    samplePayment.merchant_reference,
    samplePayment.order_tracking_id,
    samplePayment.amount,
    samplePayment.currency,
    samplePayment.customer_name,
    samplePayment.phone,
    samplePayment.email,
    samplePayment.status
  );

  console.log('✅ Sample payment created for testing');

} catch (error) {
  console.error('❌ Error creating payment tables:', error.message);
} finally {
  db.close();
}

console.log('🎉 Payment database setup completed!');

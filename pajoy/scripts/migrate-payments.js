#!/usr/bin/env node

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

console.log('🔄 Running PAJOY Payments Database Migration...');

// Determine database path
const dbPath = process.env.PAJOY_DB_DIR 
  ? path.join(process.env.PAJOY_DB_DIR, 'pajoy.db')
  : path.join(__dirname, '..', 'database', 'pajoy.db');

console.log(`📁 Database path: ${dbPath}`);

if (!fs.existsSync(dbPath)) {
  console.error('❌ Database file not found. Please run the application first to create the database.');
  process.exit(1);
}

const db = new Database(dbPath);

try {
  console.log('✅ Database connected');

  // Read and execute payment tables SQL
  const paymentTablesSql = fs.readFileSync(
    path.join(__dirname, '..', 'database', 'create_payments_table.sql'), 
    'utf8'
  );

  console.log('📝 Creating payment tables...');
  db.exec(paymentTablesSql);
  console.log('✅ Payment tables created successfully');

  // Verify tables exist
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name IN ('payments', 'payment_methods', 'payment_settings', 'payment_logs', 'payment_attempts')
  `).all();

  console.log(`📊 Created/verified ${tables.length} payment-related tables:`);
  tables.forEach(table => {
    console.log(`   - ${table.name}`);
  });

  // Insert default payment methods if they don't exist
  console.log('💳 Setting up payment methods...');
  const paymentMethods = [
    { code: 'CASH', name: 'Cash Payment', description: 'Physical cash payment', icon: '💰' },
    { code: 'MPESA', name: 'M-Pesa', description: 'Safaricom M-Pesa mobile money', icon: '📱' },
    { code: 'CARD', name: 'Credit/Debit Card', description: 'Visa, Mastercard, etc.', icon: '💳' },
    { code: 'BANK', name: 'Bank Transfer', description: 'Direct bank transfer', icon: '🏦' },
    { code: 'WALLET', name: 'Mobile Wallet', description: 'Other mobile wallet services', icon: '👛' }
  ];

  const insertPaymentMethod = db.prepare(`
    INSERT OR IGNORE INTO payment_methods (code, name, description, icon, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);

  paymentMethods.forEach(method => {
    insertPaymentMethod.run(method.code, method.name, method.description, method.icon);
  });

  console.log('✅ Payment methods configured');

  // Set up default payment settings
  console.log('⚙️ Configuring payment settings...');
  const defaultSettings = [
    { key: 'pesapal_enabled', value: 'true', description: 'Enable Pesapal payment gateway' },
    { key: 'auto_print_receipt', value: 'true', description: 'Automatically print receipt on successful payment' },
    { key: 'payment_timeout', value: '300', description: 'Payment timeout in seconds' },
    { key: 'max_retry_attempts', value: '3', description: 'Maximum retry attempts for failed payments' },
    { key: 'default_payment_method', value: 'cash', description: 'Default payment method' },
    { key: 'require_customer_info', value: 'false', description: 'Require customer information for payments' },
    { key: 'enable_split_payments', value: 'true', description: 'Enable split payment functionality' },
    { key: 'payment_confirmation_sound', value: 'true', description: 'Play sound on payment confirmation' }
  ];

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO payment_settings (key, value, description)
    VALUES (?, ?, ?)
  `);

  defaultSettings.forEach(setting => {
    insertSetting.run(setting.key, setting.value, setting.description);
  });

  console.log('✅ Payment settings configured');

  // Create indexes for performance
  console.log('🔍 Creating performance indexes...');
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_payments_status_created ON payments(status, created_at)',
    'CREATE INDEX IF NOT EXISTS idx_payments_amount ON payments(amount)',
    'CREATE INDEX IF NOT EXISTS idx_payment_logs_created ON payment_logs(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_payment_attempts_created ON payment_attempts(created_at)'
  ];

  indexes.forEach(indexSql => {
    db.exec(indexSql);
  });

  console.log('✅ Performance indexes created');

  // Display migration summary
  console.log('\n📋 Migration Summary:');
  console.log('✅ Payment system database schema updated');
  console.log('✅ Payment methods configured');
  console.log('✅ Payment settings initialized');
  console.log('✅ Performance indexes created');
  console.log('\n🎉 PAJOY Payments migration completed successfully!');

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  console.error(error.stack);
  process.exit(1);
} finally {
  db.close();
}

console.log('\n💡 Next steps:');
console.log('1. Update your .env file with Pesapal credentials');
console.log('2. Restart the PAJOY application');
console.log('3. Test the payment functionality in the POS interface');

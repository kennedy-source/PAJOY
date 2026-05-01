const Database = require('better-sqlite3');
const db = new Database('./database/pajoy.db');

try {
  // Add pesapal columns to sales table if they don't exist
  console.log('🔄 Updating sales table schema...');
  
  // Check if pesapal_amount column exists
  const checkPesapalAmount = db.prepare("SELECT name FROM pragma_table_info('sales') WHERE name = 'pesapal_amount'").get();
  if (!checkPesapalAmount) {
    console.log('Adding pesapal_amount column...');
    db.exec('ALTER TABLE sales ADD COLUMN pesapal_amount DECIMAL(10,2) DEFAULT 0');
  }
  
  // Check if pesapal_ref column exists
  const checkPesapalRef = db.prepare("SELECT name FROM pragma_table_info('sales') WHERE name = 'pesapal_ref'").get();
  if (!checkPesapalRef) {
    console.log('Adding pesapal_ref column...');
    db.exec('ALTER TABLE sales ADD COLUMN pesapal_ref TEXT');
  }
  
  // Check if mpesa columns still exist and migrate data if needed
  const checkMpesaAmount = db.prepare("SELECT name FROM pragma_table_info('sales') WHERE name = 'mpesa_amount'").get();
  const checkMpesaRef = db.prepare("SELECT name FROM pragma_table_info('sales') WHERE name = 'mpesa_ref'").get();
  
  if (checkMpesaAmount && checkMpesaRef) {
    console.log('🔄 Migrating data from mpesa to pesapal columns...');
    
    // Migrate existing mpesa data to pesapal columns
    const migrateData = db.prepare(`
      UPDATE sales 
      SET pesapal_amount = mpesa_amount, 
          pesapal_ref = mpesa_ref 
      WHERE mpesa_amount > 0 OR mpesa_ref IS NOT NULL
    `).run();
    
    console.log(`Migrated ${migrateData.changes} records from mpesa to pesapal`);
    
    // Update payment method from 'mpesa' to 'pesapal'
    const updatePaymentMethod = db.prepare(`
      UPDATE sales 
      SET payment_method = 'pesapal' 
      WHERE payment_method = 'mpesa'
    `).run();
    
    console.log(`Updated ${updatePaymentMethod.changes} records payment method from mpesa to pesapal`);
    
    // Optionally drop old mpesa columns (commented out for safety)
    // db.exec('ALTER TABLE sales DROP COLUMN mpesa_amount');
    // db.exec('ALTER TABLE sales DROP COLUMN mpesa_ref');
    console.log('ℹ️  Old mpesa columns kept for safety. You can drop them manually if needed.');
  }
  
  // Verify the schema
  const schema = db.prepare("PRAGMA table_info(sales)").all();
  console.log('📊 Updated sales table schema:');
  schema.forEach(col => {
    if (col.name.includes('pesapal') || col.name.includes('mpesa')) {
      console.log(`  - ${col.name}: ${col.type}`);
    }
  });
  
  console.log('✅ Sales table schema updated successfully!');
  
} catch (error) {
  console.error('❌ Error updating schema:', error.message);
} finally {
  db.close();
}

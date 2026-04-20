const Database = require('better-sqlite3');
const db = new Database('database/pajoy.db', { readonly: true });

try {
  // Check if password_changed_at column exists
  const result = db.prepare("PRAGMA table_info(users)").all();
  const passwordColumn = result.find(col => col.name === 'password_changed_at');
  
  if (passwordColumn) {
    console.log('✅ password_changed_at column exists in database schema');
  } else {
    console.log('❌ password_changed_at column is missing');
  }
  
  // List all columns in users table
  console.log('All columns in users table:');
  result.forEach(col => {
    console.log(`  - ${col.name} (${col.type})`);
  });
  
} catch (err) {
  console.error('Error checking database:', err.message);
} finally {
  db.close();
}

const Database = require('better-sqlite3');
const db = new Database('database/pajoy.db');

// Check if password_changed_at column exists
try {
  const result = db.prepare("SELECT password_changed_at FROM users LIMIT 1").get();
  console.log('password_changed_at column exists:', !!result);
} catch (err) {
  console.log('password_changed_at column missing, adding it...');
  db.prepare("ALTER TABLE users ADD COLUMN password_changed_at INTEGER").run();
  console.log('Added password_changed_at column successfully');
}

db.close();

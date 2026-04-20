const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

function resolveDbPath() {
  if (process.env.PAJOY_DB_DIR) {
    return path.join(process.env.PAJOY_DB_DIR, 'pajoy.db');
  }
  return path.join(__dirname, '..', 'database', 'pajoy.db');
}

const dbPath = resolveDbPath();
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Run schema if first time
const schemaPath = path.join(__dirname, '..', 'database', 'init.sql');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
}

module.exports = db;
module.exports.dbPath = dbPath;

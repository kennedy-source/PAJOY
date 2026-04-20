-- PAJOY SYSTEM SQLite schema
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','manager','cashier','production','store')),
  active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (strftime('%s','now')*1000),
  last_modified INTEGER DEFAULT (strftime('%s','now')*1000),
  device_id TEXT,
  password_changed_at INTEGER,
  login_attempts INTEGER DEFAULT 0,
  locked_until INTEGER,
  require_password_change INTEGER DEFAULT 1,
  last_login_at INTEGER,
  session_token TEXT,
  session_expires_at INTEGER
);

CREATE TABLE IF NOT EXISTS schools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  county TEXT,
  level TEXT,                -- pre-primary | primary | jss | secondary | tertiary
  gender TEXT,               -- boys | girls | mixed
  code TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  logo_path TEXT,
  notes TEXT,
  active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (strftime('%s','now')*1000),
  last_modified INTEGER DEFAULT (strftime('%s','now')*1000)
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sizes (
  id TEXT PRIMARY KEY,
  label TEXT UNIQUE NOT NULL,
  group_name TEXT,           -- kids | teens | adults | extras
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS colours (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  hex TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  school_id TEXT REFERENCES schools(id) ON DELETE SET NULL,
  base_price REAL DEFAULT 0,
  cost_price REAL DEFAULT 0,
  reorder_level INTEGER DEFAULT 5,
  image_path TEXT,
  active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (strftime('%s','now')*1000),
  last_modified INTEGER DEFAULT (strftime('%s','now')*1000)
);

CREATE TABLE IF NOT EXISTS variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_id TEXT REFERENCES sizes(id),
  colour_id TEXT REFERENCES colours(id),
  gender TEXT,
  barcode TEXT UNIQUE,
  price REAL,
  cost_price REAL,
  stock_qty INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 5,
  last_modified INTEGER DEFAULT (strftime('%s','now')*1000)
);
CREATE INDEX IF NOT EXISTS idx_variants_product ON variants(product_id);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  balance REAL DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s','now')*1000),
  last_modified INTEGER DEFAULT (strftime('%s','now')*1000)
);

CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT,
  phone TEXT,
  email TEXT,
  category TEXT,
  notes TEXT,
  created_at INTEGER DEFAULT (strftime('%s','now')*1000),
  last_modified INTEGER DEFAULT (strftime('%s','now')*1000)
);

CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  receipt_no TEXT UNIQUE NOT NULL,
  customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  cashier_id TEXT REFERENCES users(id),
  subtotal REAL NOT NULL,
  discount REAL DEFAULT 0,
  tax REAL DEFAULT 0,
  total REAL NOT NULL,
  payment_method TEXT NOT NULL,    -- cash | mpesa | mixed
  cash_amount REAL DEFAULT 0,
  mpesa_amount REAL DEFAULT 0,
  mpesa_ref TEXT,
  status TEXT DEFAULT 'completed', -- completed | refunded | cancelled
  notes TEXT,
  created_at INTEGER DEFAULT (strftime('%s','now')*1000),
  last_modified INTEGER DEFAULT (strftime('%s','now')*1000)
);
CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at);

CREATE TABLE IF NOT EXISTS sale_items (
  id TEXT PRIMARY KEY,
  sale_id TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  variant_id TEXT REFERENCES variants(id),
  product_id TEXT REFERENCES products(id),
  name_snapshot TEXT NOT NULL,
  qty INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  line_total REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);

CREATE TABLE IF NOT EXISTS inventory_logs (
  id TEXT PRIMARY KEY,
  variant_id TEXT REFERENCES variants(id),
  change_qty INTEGER NOT NULL,
  reason TEXT,                     -- sale | purchase | adjustment | return | restock
  ref_id TEXT,
  user_id TEXT REFERENCES users(id),
  created_at INTEGER DEFAULT (strftime('%s','now')*1000)
);

CREATE TABLE IF NOT EXISTS embroidery_jobs (
  id TEXT PRIMARY KEY,
  job_no TEXT UNIQUE NOT NULL,
  customer_id TEXT REFERENCES customers(id),
  school_id TEXT REFERENCES schools(id),
  garment TEXT,
  design_notes TEXT,
  thread_colours TEXT,
  placement TEXT,
  qty INTEGER DEFAULT 1,
  unit_cost REAL DEFAULT 0,
  total_cost REAL DEFAULT 0,
  due_date INTEGER,
  assigned_to TEXT REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
    -- pending | artwork | digitizing | ready | production | qa | for_collection | completed | cancelled
  created_at INTEGER DEFAULT (strftime('%s','now')*1000),
  last_modified INTEGER DEFAULT (strftime('%s','now')*1000)
);

CREATE TABLE IF NOT EXISTS print_jobs (
  id TEXT PRIMARY KEY,
  job_no TEXT UNIQUE NOT NULL,
  customer_id TEXT REFERENCES customers(id),
  print_type TEXT,                 -- screen | heat_press | vinyl | sublimation | text
  garment TEXT,
  design_notes TEXT,
  qty INTEGER DEFAULT 1,
  unit_cost REAL DEFAULT 0,
  total_cost REAL DEFAULT 0,
  due_date INTEGER,
  assigned_to TEXT REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER DEFAULT (strftime('%s','now')*1000),
  last_modified INTEGER DEFAULT (strftime('%s','now')*1000)
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  date INTEGER NOT NULL,
  user_id TEXT REFERENCES users(id),
  status TEXT DEFAULT 'pending',
  approved_by TEXT REFERENCES users(id),
  created_at INTEGER DEFAULT (strftime('%s','now')*1000),
  last_modified INTEGER DEFAULT (strftime('%s','now')*1000)
);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id TEXT REFERENCES variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled')),
  assigned_to TEXT REFERENCES users(id),
  notes TEXT,
  created_at INTEGER DEFAULT (strftime('%s','now')*1000),
  last_modified INTEGER DEFAULT (strftime('%s','now')*1000)
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  meta TEXT,
  created_at INTEGER DEFAULT (strftime('%s','now')*1000)
);

CREATE TABLE IF NOT EXISTS sync_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  op TEXT NOT NULL,                -- insert | update | delete
  payload TEXT,
  device_id TEXT,
  created_at INTEGER DEFAULT (strftime('%s','now')*1000),
  synced INTEGER DEFAULT 0
);

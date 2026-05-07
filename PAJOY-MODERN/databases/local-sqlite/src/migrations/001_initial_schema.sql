-- PAJOY Local SQLite Database Schema
-- Version 2.0.0
-- Optimized for desktop offline-first operation

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Users table with enhanced security
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'manager', 'cashier', 'owner')),
    permissions TEXT DEFAULT '[]',
    is_active INTEGER DEFAULT 1,
    last_login TEXT,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TEXT,
    password_reset_token TEXT,
    password_reset_expires TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT REFERENCES users(id),
    updated_by TEXT REFERENCES users(id)
);

-- Categories for products
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_id TEXT REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT REFERENCES users(id),
    updated_by TEXT REFERENCES users(id)
);

-- Products with enhanced fields
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category_id TEXT REFERENCES categories(id),
    base_price REAL NOT NULL,
    cost_price REAL NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    barcode TEXT,
    image_url TEXT,
    weight REAL,
    dimensions TEXT,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER DEFAULT 1000,
    reorder_point INTEGER DEFAULT 10,
    is_active INTEGER DEFAULT 1,
    tags TEXT DEFAULT '[]',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT REFERENCES users(id),
    updated_by TEXT REFERENCES users(id)
);

-- Product variants with size/color combinations
CREATE TABLE IF NOT EXISTS product_variants (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    colour TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    price REAL NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    barcode TEXT,
    image_url TEXT,
    weight REAL,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT REFERENCES users(id),
    updated_by TEXT REFERENCES users(id),
    UNIQUE(product_id, size, colour)
);

-- Enhanced customers table
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    customer_type TEXT DEFAULT 'individual' CHECK (customer_type IN ('individual', 'school', 'organization')),
    school_name TEXT,
    contact_person TEXT,
    credit_limit REAL DEFAULT 0,
    current_balance REAL DEFAULT 0,
    total_purchases REAL DEFAULT 0,
    last_purchase_date TEXT,
    notes TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT REFERENCES users(id),
    updated_by TEXT REFERENCES users(id)
);

-- Sales with enhanced tracking
CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    receipt_number TEXT UNIQUE NOT NULL,
    customer_id TEXT REFERENCES customers(id),
    subtotal REAL NOT NULL,
    discount REAL DEFAULT 0,
    discount_reason TEXT,
    tax REAL DEFAULT 0,
    tax_rate REAL DEFAULT 0.16,
    total REAL NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'mpesa', 'card', 'pesapal', 'bank-transfer', 'credit')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'failed', 'refunded')),
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('draft', 'confirmed', 'paid', 'cancelled', 'refunded')),
    cashier_id TEXT NOT NULL REFERENCES users(id),
    branch_id TEXT, -- Future multi-branch support
    notes TEXT,
    internal_notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    paid_at TEXT,
    cancelled_at TEXT,
    cancelled_by TEXT REFERENCES users(id),
    created_by TEXT REFERENCES users(id),
    updated_by TEXT REFERENCES users(id)
);

-- Sale items with detailed tracking
CREATE TABLE IF NOT EXISTS sale_items (
    id TEXT PRIMARY KEY,
    sale_id TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id),
    variant_id TEXT REFERENCES product_variants(id),
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    discount REAL DEFAULT 0,
    discount_reason TEXT,
    cost_price REAL,
    profit REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT REFERENCES users(id)
);

-- Embroidery jobs with enhanced tracking
CREATE TABLE IF NOT EXISTS embroidery_jobs (
    id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES customers(id),
    job_number TEXT UNIQUE NOT NULL,
    design_type TEXT NOT NULL CHECK (design_type IN ('logo', 'text', 'custom')),
    design_file TEXT,
    design_description TEXT,
    garment_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price_per_item REAL NOT NULL,
    total_price REAL NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    estimated_completion TEXT,
    actual_completion TEXT,
    assigned_to TEXT REFERENCES users(id),
    notes TEXT,
    internal_notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    cancelled_at TEXT,
    created_by TEXT REFERENCES users(id),
    updated_by TEXT REFERENCES users(id)
);

-- Printing jobs with enhanced tracking
CREATE TABLE IF NOT EXISTS printing_jobs (
    id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES customers(id),
    job_number TEXT UNIQUE NOT NULL,
    design_type TEXT NOT NULL CHECK (design_type IN ('screen', 'digital', 'heat-transfer')),
    design_file TEXT,
    design_description TEXT,
    garment_type TEXT NOT NULL,
    colors INTEGER DEFAULT 1,
    quantity INTEGER NOT NULL,
    price_per_item REAL NOT NULL,
    total_price REAL NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    estimated_completion TEXT,
    actual_completion TEXT,
    assigned_to TEXT REFERENCES users(id),
    notes TEXT,
    internal_notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    cancelled_at TEXT,
    created_by TEXT REFERENCES users(id),
    updated_by TEXT REFERENCES users(id)
);

-- Pesapal transactions with comprehensive tracking
CREATE TABLE IF NOT EXISTS pesapal_transactions (
    id TEXT PRIMARY KEY,
    merchant_request_id TEXT UNIQUE NOT NULL,
    order_id TEXT REFERENCES sales(id),
    customer_id TEXT REFERENCES customers(id),
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'KES',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'failed', 'refunded')),
    payment_method TEXT,
    payment_account TEXT,
    pesapal_receipt TEXT,
    transaction_date TEXT,
    callback_data TEXT,
    verification_attempts INTEGER DEFAULT 0,
    last_verification TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    created_by TEXT REFERENCES users(id),
    updated_by TEXT REFERENCES users(id)
);

-- Stock movements with comprehensive tracking
CREATE TABLE IF NOT EXISTS stock_movements (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES products(id),
    variant_id TEXT REFERENCES product_variants(id),
    type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL,
    reason TEXT NOT NULL,
    reference_id TEXT,
    reference_type TEXT,
    notes TEXT,
    unit_cost REAL,
    total_cost REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT REFERENCES users(id)
);

-- Sync operations for multi-device support
CREATE TABLE IF NOT EXISTS sync_operations (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
    data TEXT NOT NULL,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    synced INTEGER DEFAULT 0,
    sync_attempt INTEGER DEFAULT 0,
    last_error TEXT,
    device_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Business settings
CREATE TABLE IF NOT EXISTS business_settings (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    is_public INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT REFERENCES users(id),
    updated_by TEXT REFERENCES users(id)
);

-- Audit logs for compliance
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_values TEXT,
    new_values TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_active ON product_variants(is_active);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_variants_stock ON product_variants(stock);

CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active);

CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_cashier ON sales(cashier_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_payment_status ON sales(payment_status);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_variant ON sale_items(variant_id);

CREATE INDEX IF NOT EXISTS idx_embroidery_customer ON embroidery_jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_embroidery_status ON embroidery_jobs(status);
CREATE INDEX IF NOT EXISTS idx_embroidery_date ON embroidery_jobs(created_at);

CREATE INDEX IF NOT EXISTS idx_printing_customer ON printing_jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_printing_status ON printing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_printing_date ON printing_jobs(created_at);

CREATE INDEX IF NOT EXISTS idx_pesapal_order ON pesapal_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_pesapal_status ON pesapal_transactions(status);
CREATE INDEX IF NOT EXISTS idx_pesapal_merchant ON pesapal_transactions(merchant_request_id);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_variant ON stock_movements(variant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(created_at);

CREATE INDEX IF NOT EXISTS idx_sync_operations_entity ON sync_operations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sync_operations_pending ON sync_operations(synced, timestamp);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_date ON audit_logs(created_at);

-- Create triggers for updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_users_updated_at 
    AFTER UPDATE ON users
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_categories_updated_at 
    AFTER UPDATE ON categories
    BEGIN
        UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_products_updated_at 
    AFTER UPDATE ON products
    BEGIN
        UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_product_variants_updated_at 
    AFTER UPDATE ON product_variants
    BEGIN
        UPDATE product_variants SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_customers_updated_at 
    AFTER UPDATE ON customers
    BEGIN
        UPDATE customers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_sales_updated_at 
    AFTER UPDATE ON sales
    BEGIN
        UPDATE sales SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_embroidery_jobs_updated_at 
    AFTER UPDATE ON embroidery_jobs
    BEGIN
        UPDATE embroidery_jobs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_printing_jobs_updated_at 
    AFTER UPDATE ON printing_jobs
    BEGIN
        UPDATE printing_jobs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_pesapal_transactions_updated_at 
    AFTER UPDATE ON pesapal_transactions
    BEGIN
        UPDATE pesapal_transactions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_business_settings_updated_at 
    AFTER UPDATE ON business_settings
    BEGIN
        UPDATE business_settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Create views for reporting
CREATE VIEW IF NOT EXISTS sales_summary AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_sales,
    SUM(total) as total_revenue,
    AVG(total) as average_order_value,
    COUNT(DISTINCT customer_id) as unique_customers,
    payment_method,
    status
FROM sales
GROUP BY DATE(created_at), payment_method, status;

CREATE VIEW IF NOT EXISTS inventory_status AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.sku as product_sku,
    c.name as category_name,
    COALESCE(SUM(v.stock), 0) as total_stock,
    COALESCE(SUM(v.stock * v.price), 0) as stock_value,
    COUNT(v.id) as variant_count,
    COUNT(CASE WHEN v.stock <= p.reorder_point THEN 1 END) as low_stock_variants
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN product_variants v ON p.id = v.product_id AND v.is_active = 1
WHERE p.is_active = 1
GROUP BY p.id, p.name, p.sku, c.name, p.reorder_point;

CREATE VIEW IF NOT EXISTS customer_analytics AS
SELECT 
    c.id,
    c.name,
    c.customer_type,
    c.total_purchases,
    c.current_balance,
    COUNT(s.id) as order_count,
    AVG(s.total) as average_order_value,
    MAX(s.created_at) as last_order_date,
    CASE WHEN c.total_purchases > 100000 THEN 'Premium'
         WHEN c.total_purchases > 50000 THEN 'Gold'
         WHEN c.total_purchases > 10000 THEN 'Silver'
         ELSE 'Bronze' END as customer_tier
FROM customers c
LEFT JOIN sales s ON c.id = s.customer_id
WHERE c.is_active = 1
GROUP BY c.id, c.name, c.customer_type, c.total_purchases, c.current_balance;

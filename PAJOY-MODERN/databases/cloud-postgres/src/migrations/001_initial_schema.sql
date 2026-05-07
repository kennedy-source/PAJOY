-- PAJOY Cloud PostgreSQL Database Schema
-- Version 2.0.0
-- Production-ready schema for Kenyan retail business

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'cashier', 'owner');
CREATE TYPE customer_type AS ENUM ('individual', 'school', 'organization');
CREATE TYPE payment_method AS ENUM ('cash', 'mpesa', 'card', 'pesapal', 'bank-transfer', 'credit');
CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid', 'failed', 'refunded');
CREATE TYPE sale_status AS ENUM ('draft', 'confirmed', 'paid', 'cancelled', 'refunded');
CREATE TYPE job_status AS ENUM ('pending', 'in-progress', 'completed', 'cancelled');
CREATE TYPE embroidery_type AS ENUM ('logo', 'text', 'custom');
CREATE TYPE printing_type AS ENUM ('screen', 'digital', 'heat-transfer');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE stock_movement_type AS ENUM ('in', 'out', 'adjustment');
CREATE TYPE sync_operation_type AS ENUM ('create', 'update', 'delete');

-- Users table with enhanced security
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'cashier',
    permissions TEXT[] DEFAULT ARRAY[],
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Categories for products
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Products with enhanced fields
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    base_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    barcode VARCHAR(50),
    image_url VARCHAR(500),
    weight DECIMAL(8,3),
    dimensions VARCHAR(50),
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER DEFAULT 1000,
    reorder_point INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Product variants with size/color combinations
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size VARCHAR(20) NOT NULL,
    colour VARCHAR(50) NOT NULL,
    stock INTEGER DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    barcode VARCHAR(50),
    image_url VARCHAR(500),
    weight DECIMAL(8,3),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    UNIQUE(product_id, size, colour)
);

-- Enhanced customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    customer_type customer_type DEFAULT 'individual',
    school_name VARCHAR(255),
    contact_person VARCHAR(255),
    credit_limit DECIMAL(10,2) DEFAULT 0,
    current_balance DECIMAL(10,2) DEFAULT 0,
    total_purchases DECIMAL(10,2) DEFAULT 0,
    last_purchase_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Sales with enhanced tracking
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    discount_reason TEXT,
    tax DECIMAL(10,2) DEFAULT 0,
    tax_rate DECIMAL(5,4) DEFAULT 0.16,
    total DECIMAL(10,2) NOT NULL,
    payment_method payment_method NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    status sale_status DEFAULT 'confirmed',
    cashier_id UUID NOT NULL REFERENCES users(id),
    branch_id UUID, -- Future multi-branch support
    notes TEXT,
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Sale items with detailed tracking
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    discount_reason TEXT,
    cost_price DECIMAL(10,2),
    profit DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Embroidery jobs with enhanced tracking
CREATE TABLE embroidery_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    job_number VARCHAR(50) UNIQUE NOT NULL,
    design_type embroidery_type NOT NULL,
    design_file VARCHAR(500),
    design_description TEXT,
    garment_type VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    price_per_item DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status job_status DEFAULT 'pending',
    priority priority_level DEFAULT 'medium',
    estimated_completion TIMESTAMP WITH TIME ZONE,
    actual_completion TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES users(id),
    notes TEXT,
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Printing jobs with enhanced tracking
CREATE TABLE printing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    job_number VARCHAR(50) UNIQUE NOT NULL,
    design_type printing_type NOT NULL,
    design_file VARCHAR(500),
    design_description TEXT,
    garment_type VARCHAR(100) NOT NULL,
    colors INTEGER DEFAULT 1,
    quantity INTEGER NOT NULL,
    price_per_item DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status job_status DEFAULT 'pending',
    priority priority_level DEFAULT 'medium',
    estimated_completion TIMESTAMP WITH TIME ZONE,
    actual_completion TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES users(id),
    notes TEXT,
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Pesapal transactions with comprehensive tracking
CREATE TABLE pesapal_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_request_id VARCHAR(100) UNIQUE NOT NULL,
    order_id UUID REFERENCES sales(id),
    customer_id UUID REFERENCES customers(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KES',
    status payment_status DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_account VARCHAR(100),
    pesapal_receipt VARCHAR(100),
    transaction_date TIMESTAMP WITH TIME ZONE,
    callback_data JSONB,
    verification_attempts INTEGER DEFAULT 0,
    last_verification TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Stock movements with comprehensive tracking
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    type stock_movement_type NOT NULL,
    quantity INTEGER NOT NULL,
    reason VARCHAR(100) NOT NULL,
    reference_id UUID,
    reference_type VARCHAR(50),
    notes TEXT,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Sync operations for multi-device support
CREATE TABLE sync_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    operation sync_operation_type NOT NULL,
    data JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    synced BOOLEAN DEFAULT false,
    sync_attempt INTEGER DEFAULT 0,
    last_error TEXT,
    device_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Business settings
CREATE TABLE business_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Audit logs for compliance
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('english', name));

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_active ON product_variants(is_active);
CREATE INDEX idx_variants_sku ON product_variants(sku);
CREATE INDEX idx_variants_stock ON product_variants(stock);

CREATE INDEX idx_customers_type ON customers(customer_type);
CREATE INDEX idx_customers_active ON customers(is_active);
CREATE INDEX idx_customers_name ON customers USING gin(to_tsvector('english', name));

CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_cashier ON sales(cashier_id);
CREATE INDEX idx_sales_date ON sales(created_at);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_payment_status ON sales(payment_status);

CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);
CREATE INDEX idx_sale_items_variant ON sale_items(variant_id);

CREATE INDEX idx_embroidery_customer ON embroidery_jobs(customer_id);
CREATE INDEX idx_embroidery_status ON embroidery_jobs(status);
CREATE INDEX idx_embroidery_date ON embroidery_jobs(created_at);

CREATE INDEX idx_printing_customer ON printing_jobs(customer_id);
CREATE INDEX idx_printing_status ON printing_jobs(status);
CREATE INDEX idx_printing_date ON printing_jobs(created_at);

CREATE INDEX idx_pesapal_order ON pesapal_transactions(order_id);
CREATE INDEX idx_pesapal_status ON pesapal_transactions(status);
CREATE INDEX idx_pesapal_merchant ON pesapal_transactions(merchant_request_id);

CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_variant ON stock_movements(variant_id);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at);

CREATE INDEX idx_sync_operations_entity ON sync_operations(entity_type, entity_id);
CREATE INDEX idx_sync_operations_pending ON sync_operations(synced, timestamp);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_embroidery_jobs_updated_at BEFORE UPDATE ON embroidery_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_printing_jobs_updated_at BEFORE UPDATE ON printing_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pesapal_transactions_updated_at BEFORE UPDATE ON pesapal_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON business_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for sales summaries
CREATE VIEW sales_summary AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_sales,
    SUM(total) as total_revenue,
    AVG(total) as average_order_value,
    COUNT(DISTINCT customer_id) as unique_customers,
    payment_method,
    status
FROM sales
GROUP BY DATE_TRUNC('day', created_at), payment_method, status;

-- Create view for inventory status
CREATE VIEW inventory_status AS
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
LEFT JOIN product_variants v ON p.id = v.product_id AND v.is_active = true
WHERE p.is_active = true
GROUP BY p.id, p.name, p.sku, c.name, p.reorder_point;

-- Create view for customer analytics
CREATE VIEW customer_analytics AS
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
WHERE c.is_active = true
GROUP BY c.id, c.name, c.customer_type, c.total_purchases, c.current_balance;

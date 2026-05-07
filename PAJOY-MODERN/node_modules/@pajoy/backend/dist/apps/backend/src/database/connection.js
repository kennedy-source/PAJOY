"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabase = exports.connectDatabase = exports.sqliteDb = exports.pgPool = void 0;
const pg_1 = require("pg");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const logger_1 = require("../utils/logger");
const constants_1 = require("@pajoy/constants");
const getDatabaseConfig = () => {
    const nodeEnv = process.env.NODE_ENV || 'development';
    if (nodeEnv === 'production' && process.env.DATABASE_URL) {
        // Production: Use PostgreSQL from DATABASE_URL
        return {
            type: 'postgresql',
            database: process.env.DATABASE_URL
        };
    }
    else if (nodeEnv === 'production') {
        // Production: Use PostgreSQL with individual env vars
        return {
            type: 'postgresql',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME || 'pajoy_production',
            username: process.env.DB_USER || '',
            password: process.env.DB_PASSWORD || '',
            ssl: process.env.DB_SSL === 'true'
        };
    }
    else {
        // Development: Use SQLite
        return {
            type: 'sqlite',
            database: process.env.SQLITE_DB_PATH || './database/pajoy.db'
        };
    }
};
const connectDatabase = async () => {
    const config = getDatabaseConfig();
    try {
        if (config.type === 'postgresql') {
            await connectPostgreSQL(config);
        }
        else {
            await connectSQLite(config);
        }
        logger_1.logger.info(`Connected to ${config.type} database successfully`);
    }
    catch (error) {
        logger_1.logger.error('Failed to connect to database:', error);
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
const connectPostgreSQL = async (config) => {
    const poolConfig = {
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.username,
        password: config.password,
        ssl: config.ssl ? { rejectUnauthorized: false } : false,
        max: constants_1.DATABASE_CONFIG.POSTGRESQL.MAX_CONNECTIONS,
        connectionTimeoutMillis: constants_1.DATABASE_CONFIG.POSTGRESQL.CONNECTION_TIMEOUT,
        idleTimeoutMillis: constants_1.DATABASE_CONFIG.POSTGRESQL.IDLE_TIMEOUT,
    };
    exports.pgPool = new pg_1.Pool(poolConfig);
    // Test connection
    const client = await exports.pgPool.connect();
    try {
        await client.query('SELECT NOW()');
        logger_1.logger.info('PostgreSQL connection test successful');
    }
    finally {
        client.release();
    }
    // Run migrations
    await runPostgreSQLMigrations();
};
const connectSQLite = async (config) => {
    exports.sqliteDb = new better_sqlite3_1.default(config.database);
    // Enable foreign keys
    exports.sqliteDb.pragma('foreign_keys = ON');
    // Test connection
    exports.sqliteDb.prepare('SELECT 1').get();
    logger_1.logger.info('SQLite connection test successful');
    // Run migrations
    await runSQLiteMigrations();
};
const runPostgreSQLMigrations = async () => {
    const migrations = [
        `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'cashier',
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
        `
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        address TEXT,
        customer_type VARCHAR(20) DEFAULT 'individual',
        school_name VARCHAR(255),
        credit_limit DECIMAL(10,2) DEFAULT 0,
        current_balance DECIMAL(10,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
        `
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
        `
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category_id UUID REFERENCES categories(id),
        base_price DECIMAL(10,2) NOT NULL,
        cost_price DECIMAL(10,2) NOT NULL,
        sku VARCHAR(50) UNIQUE NOT NULL,
        barcode VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
        `
      CREATE TABLE IF NOT EXISTS product_variants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        size VARCHAR(20) NOT NULL,
        colour VARCHAR(50) NOT NULL,
        stock INTEGER DEFAULT 0,
        price DECIMAL(10,2) NOT NULL,
        sku VARCHAR(50) UNIQUE NOT NULL,
        barcode VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
        `
      CREATE TABLE IF NOT EXISTS sales (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        receipt_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id UUID REFERENCES customers(id),
        subtotal DECIMAL(10,2) NOT NULL,
        discount DECIMAL(10,2) DEFAULT 0,
        tax DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(20) NOT NULL,
        payment_status VARCHAR(20) DEFAULT 'pending',
        status VARCHAR(20) DEFAULT 'confirmed',
        cashier_id UUID REFERENCES users(id),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP
      );
    `,
        `
      CREATE TABLE IF NOT EXISTS sale_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id),
        variant_id UUID REFERENCES product_variants(id),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        discount DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
        `
      CREATE TABLE IF NOT EXISTS embroidery_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID REFERENCES customers(id),
        job_number VARCHAR(50) UNIQUE NOT NULL,
        design_type VARCHAR(20) NOT NULL,
        design_file VARCHAR(255),
        design_description TEXT,
        garment_type VARCHAR(100) NOT NULL,
        quantity INTEGER NOT NULL,
        price_per_item DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        priority VARCHAR(10) DEFAULT 'medium',
        estimated_completion TIMESTAMP,
        actual_completion TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
        `
      CREATE TABLE IF NOT EXISTS printing_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID REFERENCES customers(id),
        job_number VARCHAR(50) UNIQUE NOT NULL,
        design_type VARCHAR(20) NOT NULL,
        design_file VARCHAR(255),
        design_description TEXT,
        garment_type VARCHAR(100) NOT NULL,
        colors INTEGER DEFAULT 1,
        quantity INTEGER NOT NULL,
        price_per_item DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        priority VARCHAR(10) DEFAULT 'medium',
        estimated_completion TIMESTAMP,
        actual_completion TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
        `
      CREATE TABLE IF NOT EXISTS pesapal_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        merchant_request_id VARCHAR(100) UNIQUE NOT NULL,
        order_id UUID REFERENCES sales(id),
        customer_id UUID REFERENCES customers(id),
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'KES',
        status VARCHAR(20) DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_account VARCHAR(100),
        pesapal_receipt VARCHAR(100),
        transaction_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      );
    `,
        `
      CREATE TABLE IF NOT EXISTS sync_operations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(100) NOT NULL,
        operation VARCHAR(10) NOT NULL,
        data JSONB NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        synced BOOLEAN DEFAULT false,
        sync_attempt INTEGER DEFAULT 0,
        last_error TEXT
      );
    `,
        `
      CREATE TABLE IF NOT EXISTS stock_movements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id),
        variant_id UUID REFERENCES product_variants(id),
        type VARCHAR(10) NOT NULL,
        quantity INTEGER NOT NULL,
        reason VARCHAR(100) NOT NULL,
        reference_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
    ];
    for (const migration of migrations) {
        try {
            await exports.pgPool.query(migration);
        }
        catch (error) {
            logger_1.logger.error('Migration failed:', error);
            throw error;
        }
    }
    logger_1.logger.info('PostgreSQL migrations completed');
};
const runSQLiteMigrations = async () => {
    const migrations = [
        `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        role TEXT DEFAULT 'cashier',
        is_active INTEGER DEFAULT 1,
        last_login TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `,
        `
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        address TEXT,
        customer_type TEXT DEFAULT 'individual',
        school_name TEXT,
        credit_limit REAL DEFAULT 0,
        current_balance REAL DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `,
        `
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `,
        `
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category_id TEXT,
        base_price REAL NOT NULL,
        cost_price REAL NOT NULL,
        sku TEXT UNIQUE NOT NULL,
        barcode TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );
    `,
        `
      CREATE TABLE IF NOT EXISTS product_variants (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        size TEXT NOT NULL,
        colour TEXT NOT NULL,
        stock INTEGER DEFAULT 0,
        price REAL NOT NULL,
        sku TEXT UNIQUE NOT NULL,
        barcode TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
    `,
        `
      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        receipt_number TEXT UNIQUE NOT NULL,
        customer_id TEXT,
        subtotal REAL NOT NULL,
        discount REAL DEFAULT 0,
        tax REAL DEFAULT 0,
        total REAL NOT NULL,
        payment_method TEXT NOT NULL,
        payment_status TEXT DEFAULT 'pending',
        status TEXT DEFAULT 'confirmed',
        cashier_id TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        paid_at TEXT,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (cashier_id) REFERENCES users(id)
      );
    `,
        `
      CREATE TABLE IF NOT EXISTS sale_items (
        id TEXT PRIMARY KEY,
        sale_id TEXT NOT NULL,
        product_id TEXT,
        variant_id TEXT,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        discount REAL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (variant_id) REFERENCES product_variants(id)
      );
    `,
        `
      CREATE TABLE IF NOT EXISTS embroidery_jobs (
        id TEXT PRIMARY KEY,
        customer_id TEXT,
        job_number TEXT UNIQUE NOT NULL,
        design_type TEXT NOT NULL,
        design_file TEXT,
        design_description TEXT,
        garment_type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price_per_item REAL NOT NULL,
        total_price REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        estimated_completion TEXT,
        actual_completion TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );
    `,
        `
      CREATE TABLE IF NOT EXISTS printing_jobs (
        id TEXT PRIMARY KEY,
        customer_id TEXT,
        job_number TEXT UNIQUE NOT NULL,
        design_type TEXT NOT NULL,
        design_file TEXT,
        design_description TEXT,
        garment_type TEXT NOT NULL,
        colors INTEGER DEFAULT 1,
        quantity INTEGER NOT NULL,
        price_per_item REAL NOT NULL,
        total_price REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        estimated_completion TEXT,
        actual_completion TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );
    `,
        `
      CREATE TABLE IF NOT EXISTS pesapal_transactions (
        id TEXT PRIMARY KEY,
        merchant_request_id TEXT UNIQUE NOT NULL,
        order_id TEXT,
        customer_id TEXT,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'KES',
        status TEXT DEFAULT 'pending',
        payment_method TEXT,
        payment_account TEXT,
        pesapal_receipt TEXT,
        transaction_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT,
        FOREIGN KEY (order_id) REFERENCES sales(id),
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );
    `,
        `
      CREATE TABLE IF NOT EXISTS sync_operations (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0,
        sync_attempt INTEGER DEFAULT 0,
        last_error TEXT
      );
    `,
        `
      CREATE TABLE IF NOT EXISTS stock_movements (
        id TEXT PRIMARY KEY,
        product_id TEXT,
        variant_id TEXT,
        type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        reason TEXT NOT NULL,
        reference_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (variant_id) REFERENCES product_variants(id)
      );
    `
    ];
    for (const migration of migrations) {
        try {
            exports.sqliteDb.exec(migration);
        }
        catch (error) {
            logger_1.logger.error('SQLite migration failed:', error);
            throw error;
        }
    }
    logger_1.logger.info('SQLite migrations completed');
};
const closeDatabase = async () => {
    if (exports.pgPool) {
        await exports.pgPool.end();
        logger_1.logger.info('PostgreSQL connection closed');
    }
    if (exports.sqliteDb) {
        exports.sqliteDb.close();
        logger_1.logger.info('SQLite connection closed');
    }
};
exports.closeDatabase = closeDatabase;
//# sourceMappingURL=connection.js.map
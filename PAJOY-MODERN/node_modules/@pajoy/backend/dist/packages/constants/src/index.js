"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UI_CONFIG = exports.VALIDATION_RULES = exports.ERROR_CODES = exports.DATABASE_CONFIG = exports.SYNC_CONFIG = exports.PESAPAL_CONFIG = exports.API_ENDPOINTS = exports.INVENTORY_SETTINGS = exports.RECEIPT_SETTINGS = exports.BUSINESS_HOURS = exports.TAX_SETTINGS = exports.PRIORITIES = exports.GARMENT_TYPES = exports.PRINTING_TYPES = exports.EMBROIDERY_TYPES = exports.ROLE_PERMISSIONS = exports.PERMISSIONS = exports.USER_ROLES = exports.JOB_STATUS = exports.SALE_STATUS = exports.PAYMENT_STATUS = exports.PAYMENT_METHODS = exports.COLORS = exports.SIZES = exports.PRODUCT_CATEGORIES = exports.DEFAULT_CURRENCY = exports.CURRENCIES = exports.BUSINESS_DESCRIPTION = exports.BUSINESS_TAGLINE = exports.BUSINESS_NAME = void 0;
// Business Constants
exports.BUSINESS_NAME = 'PAJOY Uniforms';
exports.BUSINESS_TAGLINE = 'Quality School Uniforms & Custom Apparel';
exports.BUSINESS_DESCRIPTION = 'Professional school uniforms, embroidery, and printing services for Kenyan institutions';
// Currency Constants
exports.CURRENCIES = {
    KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
    USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
    EUR: { code: 'EUR', symbol: '€', name: 'Euro' }
};
exports.DEFAULT_CURRENCY = exports.CURRENCIES.KES;
// Product Categories
exports.PRODUCT_CATEGORIES = {
    UNIFORMS: 'uniforms',
    SWEATERS: 'sweaters',
    HOODIES: 'hoodies',
    TROUSERS: 'trousers',
    SKIRTS: 'skirts',
    TRACKSUITS: 'tracksuits',
    SOCKS: 'socks',
    BELTS: 'belts',
    SHOES: 'shoes',
    ACCESSORIES: 'accessories'
};
// Sizes
exports.SIZES = {
    // School Uniform Sizes
    BABY: ['0-3M', '3-6M', '6-9M', '9-12M'],
    TODDLER: ['1-2Y', '2-3Y', '3-4Y'],
    KIDS: ['4-5Y', '5-6Y', '6-7Y', '7-8Y', '8-9Y', '9-10Y', '10-11Y', '11-12Y'],
    TEENS: ['12-13Y', '13-14Y', '14-15Y', '15-16Y', '16-17Y'],
    ADULTS: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    // Standard Clothing Sizes
    NUMERIC: ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48'],
    // Shoe Sizes
    SHOES: {
        KIDS: ['6', '7', '8', '9', '10', '11', '12', '13', '1', '2', '3', '4', '5'],
        ADULTS: ['6', '7', '8', '9', '10', '11', '12', '13']
    }
};
// Colors
exports.COLORS = {
    // School Uniform Colors
    WHITE: 'White',
    BLACK: 'Black',
    NAVY: 'Navy Blue',
    ROYAL: 'Royal Blue',
    SKY: 'Sky Blue',
    GREY: 'Grey',
    MAROON: 'Maroon',
    GREEN: 'Green',
    KHAKI: 'Khaki',
    BEIGE: 'Beige',
    BROWN: 'Brown',
    RED: 'Red',
    YELLOW: 'Yellow',
    PURPLE: 'Purple',
    ORANGE: 'Orange',
    PINK: 'Pink'
};
// Payment Methods
exports.PAYMENT_METHODS = {
    CASH: 'cash',
    MPESA: 'mpesa',
    CARD: 'card',
    PESAPAL: 'pesapal',
    BANK_TRANSFER: 'bank-transfer',
    CREDIT: 'credit'
};
// Payment Status
exports.PAYMENT_STATUS = {
    PENDING: 'pending',
    PARTIAL: 'partial',
    PAID: 'paid',
    FAILED: 'failed',
    REFUNDED: 'refunded'
};
// Sale Status
exports.SALE_STATUS = {
    DRAFT: 'draft',
    CONFIRMED: 'confirmed',
    PAID: 'paid',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
};
// Job Status
exports.JOB_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};
// User Roles
exports.USER_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    CASHIER: 'cashier',
    OWNER: 'owner'
};
// Permissions
exports.PERMISSIONS = {
    // Sales
    SALES_CREATE: 'sales.create',
    SALES_EDIT: 'sales.edit',
    SALES_DELETE: 'sales.delete',
    SALES_VIEW: 'sales.view',
    // Inventory
    INVENTORY_MANAGE: 'inventory.manage',
    // Customers
    CUSTOMERS_MANAGE: 'customers.manage',
    // Jobs
    EMBROIDERY_MANAGE: 'embroidery.manage',
    PRINTING_MANAGE: 'printing.manage',
    // Reports
    REPORTS_VIEW: 'reports.view',
    // Settings
    SETTINGS_MANAGE: 'settings.manage',
    // Users
    USERS_MANAGE: 'users.manage'
};
// Default Permissions by Role
exports.ROLE_PERMISSIONS = {
    [exports.USER_ROLES.ADMIN]: Object.values(exports.PERMISSIONS),
    [exports.USER_ROLES.MANAGER]: [
        exports.PERMISSIONS.SALES_CREATE,
        exports.PERMISSIONS.SALES_EDIT,
        exports.PERMISSIONS.SALES_VIEW,
        exports.PERMISSIONS.INVENTORY_MANAGE,
        exports.PERMISSIONS.CUSTOMERS_MANAGE,
        exports.PERMISSIONS.EMBROIDERY_MANAGE,
        exports.PERMISSIONS.PRINTING_MANAGE,
        exports.PERMISSIONS.REPORTS_VIEW
    ],
    [exports.USER_ROLES.CASHIER]: [
        exports.PERMISSIONS.SALES_CREATE,
        exports.PERMISSIONS.SALES_VIEW,
        exports.PERMISSIONS.INVENTORY_MANAGE,
        exports.PERMISSIONS.CUSTOMERS_MANAGE
    ],
    [exports.USER_ROLES.OWNER]: Object.values(exports.PERMISSIONS)
};
// Embroidery Design Types
exports.EMBROIDERY_TYPES = {
    LOGO: 'logo',
    TEXT: 'text',
    CUSTOM: 'custom'
};
// Printing Types
exports.PRINTING_TYPES = {
    SCREEN: 'screen',
    DIGITAL: 'digital',
    HEAT_TRANSFER: 'heat-transfer'
};
// Garment Types
exports.GARMENT_TYPES = {
    T_SHIRT: 't-shirt',
    POLO: 'polo',
    HOODIE: 'hoodie',
    SWEATSHIRT: 'sweatshirt',
    JACKET: 'jacket',
    BLOUSE: 'blouse',
    SHIRT: 'shirt',
    TROUSERS: 'trousers',
    SKIRT: 'skirt',
    DRESS: 'dress',
    CAP: 'cap',
    BAG: 'bag'
};
// Priority Levels
exports.PRIORITIES = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
};
// Tax Settings
exports.TAX_SETTINGS = {
    VAT_RATE: 0.16, // 16% VAT in Kenya
    DEFAULT_TAX_RATE: 0.16
};
// Business Hours
exports.BUSINESS_HOURS = {
    WEEKDAYS: { open: '08:00', close: '18:00' },
    SATURDAY: { open: '08:00', close: '16:00' },
    SUNDAY: { open: 'closed', close: 'closed' }
};
// Receipt Settings
exports.RECEIPT_SETTINGS = {
    WIDTH: 80, // mm for thermal printer
    HEADER_LINES: 5,
    FOOTER_LINES: 3,
    AUTO_PRINT: true,
    COPIES: 1
};
// Inventory Settings
exports.INVENTORY_SETTINGS = {
    LOW_STOCK_THRESHOLD: 10,
    AUTO_REORDER_POINT: 5,
    STOCK_MOVEMENT_REASONS: {
        SALE: 'Sale',
        PURCHASE: 'Purchase',
        RETURN: 'Return',
        ADJUSTMENT: 'Stock Adjustment',
        DAMAGE: 'Damage',
        TRANSFER: 'Transfer',
        PRODUCTION: 'Production'
    }
};
// API Constants
exports.API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        REFRESH: '/api/auth/refresh',
        PROFILE: '/api/auth/profile'
    },
    PRODUCTS: '/api/products',
    CUSTOMERS: '/api/customers',
    SALES: '/api/sales',
    INVENTORY: '/api/inventory',
    EMBROIDERY: '/api/embroidery',
    PRINTING: '/api/printing',
    REPORTS: '/api/reports',
    SETTINGS: '/api/settings',
    USERS: '/api/users',
    SYNC: '/api/sync',
    PESAPAL: {
        REQUEST_TOKEN: '/api/pesapal/request-token',
        CREATE_ORDER: '/api/pesapal/create-order',
        CALLBACK: '/api/pesapal/callback',
        STATUS: '/api/pesapal/status'
    }
};
// Pesapal Constants
exports.PESAPAL_CONFIG = {
    BASE_URL: 'https://pay.pesapal.com/v3',
    SANDBOX_URL: 'https://cybertest.pesapal.com/v3',
    ENDPOINTS: {
        GET_ACCESS_TOKEN: '/api/GetAccessToken',
        POST_TRANSACTION: '/api/PostTransaction',
        TRANSACTION_STATUS: '/api/GetTransactionStatus'
    },
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 second
};
// Sync Constants
exports.SYNC_CONFIG = {
    BATCH_SIZE: 100,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 5000, // 5 seconds
    SYNC_INTERVAL: 60000, // 1 minute
    CONFLICT_RESOLUTION: 'last-write-wins'
};
// Database Constants
exports.DATABASE_CONFIG = {
    SQLITE: {
        FILENAME: 'pajoy.db',
        BACKUP_INTERVAL: 3600000, // 1 hour
        MAX_BACKUPS: 10
    },
    POSTGRESQL: {
        MAX_CONNECTIONS: 20,
        CONNECTION_TIMEOUT: 30000,
        IDLE_TIMEOUT: 10000
    }
};
// Error Codes
exports.ERROR_CODES = {
    // General
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    // Business Logic
    INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
    INVALID_PAYMENT: 'INVALID_PAYMENT',
    CUSTOMER_CREDIT_LIMIT: 'CUSTOMER_CREDIT_LIMIT',
    DUPLICATE_ORDER: 'DUPLICATE_ORDER',
    // Pesapal
    PESAPAL_TOKEN_ERROR: 'PESAPAL_TOKEN_ERROR',
    PESAPAL_PAYMENT_ERROR: 'PESAPAL_PAYMENT_ERROR',
    PESAPAL_CALLBACK_ERROR: 'PESAPAL_CALLBACK_ERROR',
    // Sync
    SYNC_ERROR: 'SYNC_ERROR',
    CONFLICT_ERROR: 'CONFLICT_ERROR',
    OFFLINE_MODE: 'OFFLINE_MODE'
};
// Validation Rules
exports.VALIDATION_RULES = {
    PHONE: {
        KENYA: /^(\+254|254|0)[1-9]\d{8}$/,
        MIN_LENGTH: 10,
        MAX_LENGTH: 15
    },
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD: {
        MIN_LENGTH: 8,
        REQUIRE_UPPERCASE: true,
        REQUIRE_LOWERCASE: true,
        REQUIRE_NUMBERS: true,
        REQUIRE_SPECIAL: false
    },
    SKU: /^[A-Z0-9]{3,12}$/,
    BARCODE: /^\d{8,13}$/
};
// UI Constants
exports.UI_CONFIG = {
    THEME: {
        PRIMARY_COLOR: '#3B82F6', // Sky blue
        SECONDARY_COLOR: '#10B981', // Emerald
        ACCENT_COLOR: '#F59E0B', // Amber
        BACKGROUND_COLOR: '#F9FAFB',
        SURFACE_COLOR: '#FFFFFF',
        TEXT_COLOR: '#111827',
        TEXT_SECONDARY: '#6B7280',
        BORDER_COLOR: '#E5E7EB',
        ERROR_COLOR: '#EF4444',
        SUCCESS_COLOR: '#10B981',
        WARNING_COLOR: '#F59E0B'
    },
    BREAKPOINTS: {
        MOBILE: 640,
        TABLET: 768,
        DESKTOP: 1024,
        LARGE_DESKTOP: 1280
    },
    ANIMATIONS: {
        DURATION: {
            FAST: 150,
            NORMAL: 300,
            SLOW: 500
        },
        EASING: {
            EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }
    }
};
// Export all constants - all exports are defined above
//# sourceMappingURL=index.js.map
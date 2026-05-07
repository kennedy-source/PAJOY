// Business Constants
export const BUSINESS_NAME = 'PAJOY Uniforms';
export const BUSINESS_TAGLINE = 'Quality School Uniforms & Custom Apparel';
export const BUSINESS_DESCRIPTION = 'Professional school uniforms, embroidery, and printing services for Kenyan institutions';

// Currency Constants
export const CURRENCIES = {
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' }
} as const;

export const DEFAULT_CURRENCY = CURRENCIES.KES;

// Product Categories
export const PRODUCT_CATEGORIES = {
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
} as const;

// Sizes
export const SIZES = {
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
} as const;

// Colors
export const COLORS = {
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
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  MPESA: 'mpesa',
  CARD: 'card',
  PESAPAL: 'pesapal',
  BANK_TRANSFER: 'bank-transfer',
  CREDIT: 'credit'
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
} as const;

// Sale Status
export const SALE_STATUS = {
  DRAFT: 'draft',
  CONFIRMED: 'confirmed',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const;

// Job Status
export const JOB_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
  OWNER: 'owner'
} as const;

// Permissions
export const PERMISSIONS = {
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
} as const;

// Default Permissions by Role
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: Object.values(PERMISSIONS),
  [USER_ROLES.MANAGER]: [
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_EDIT,
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.CUSTOMERS_MANAGE,
    PERMISSIONS.EMBROIDERY_MANAGE,
    PERMISSIONS.PRINTING_MANAGE,
    PERMISSIONS.REPORTS_VIEW
  ],
  [USER_ROLES.CASHIER]: [
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.CUSTOMERS_MANAGE
  ],
  [USER_ROLES.OWNER]: Object.values(PERMISSIONS)
} as const;

// Embroidery Design Types
export const EMBROIDERY_TYPES = {
  LOGO: 'logo',
  TEXT: 'text',
  CUSTOM: 'custom'
} as const;

// Printing Types
export const PRINTING_TYPES = {
  SCREEN: 'screen',
  DIGITAL: 'digital',
  HEAT_TRANSFER: 'heat-transfer'
} as const;

// Garment Types
export const GARMENT_TYPES = {
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
} as const;

// Priority Levels
export const PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

// Tax Settings
export const TAX_SETTINGS = {
  VAT_RATE: 0.16, // 16% VAT in Kenya
  DEFAULT_TAX_RATE: 0.16
} as const;

// Business Hours
export const BUSINESS_HOURS = {
  WEEKDAYS: { open: '08:00', close: '18:00' },
  SATURDAY: { open: '08:00', close: '16:00' },
  SUNDAY: { open: 'closed', close: 'closed' }
} as const;

// Receipt Settings
export const RECEIPT_SETTINGS = {
  WIDTH: 80, // mm for thermal printer
  HEADER_LINES: 5,
  FOOTER_LINES: 3,
  AUTO_PRINT: true,
  COPIES: 1
} as const;

// Inventory Settings
export const INVENTORY_SETTINGS = {
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
} as const;

// API Constants
export const API_ENDPOINTS = {
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
} as const;

// Pesapal Constants
export const PESAPAL_CONFIG = {
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
} as const;

// Sync Constants
export const SYNC_CONFIG = {
  BATCH_SIZE: 100,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 5000, // 5 seconds
  SYNC_INTERVAL: 60000, // 1 minute
  CONFLICT_RESOLUTION: 'last-write-wins' as const
} as const;

// Database Constants
export const DATABASE_CONFIG = {
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
} as const;

// Error Codes
export const ERROR_CODES = {
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
} as const;

// Validation Rules
export const VALIDATION_RULES = {
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
} as const;

// UI Constants
export const UI_CONFIG = {
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
} as const;

// Export all constants - all exports are defined above

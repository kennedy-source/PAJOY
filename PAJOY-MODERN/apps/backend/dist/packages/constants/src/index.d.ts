export declare const BUSINESS_NAME = "PAJOY Uniforms";
export declare const BUSINESS_TAGLINE = "Quality School Uniforms & Custom Apparel";
export declare const BUSINESS_DESCRIPTION = "Professional school uniforms, embroidery, and printing services for Kenyan institutions";
export declare const CURRENCIES: {
    readonly KES: {
        readonly code: "KES";
        readonly symbol: "KSh";
        readonly name: "Kenyan Shilling";
    };
    readonly USD: {
        readonly code: "USD";
        readonly symbol: "$";
        readonly name: "US Dollar";
    };
    readonly EUR: {
        readonly code: "EUR";
        readonly symbol: "€";
        readonly name: "Euro";
    };
};
export declare const DEFAULT_CURRENCY: {
    readonly code: "KES";
    readonly symbol: "KSh";
    readonly name: "Kenyan Shilling";
};
export declare const PRODUCT_CATEGORIES: {
    readonly UNIFORMS: "uniforms";
    readonly SWEATERS: "sweaters";
    readonly HOODIES: "hoodies";
    readonly TROUSERS: "trousers";
    readonly SKIRTS: "skirts";
    readonly TRACKSUITS: "tracksuits";
    readonly SOCKS: "socks";
    readonly BELTS: "belts";
    readonly SHOES: "shoes";
    readonly ACCESSORIES: "accessories";
};
export declare const SIZES: {
    readonly BABY: readonly ["0-3M", "3-6M", "6-9M", "9-12M"];
    readonly TODDLER: readonly ["1-2Y", "2-3Y", "3-4Y"];
    readonly KIDS: readonly ["4-5Y", "5-6Y", "6-7Y", "7-8Y", "8-9Y", "9-10Y", "10-11Y", "11-12Y"];
    readonly TEENS: readonly ["12-13Y", "13-14Y", "14-15Y", "15-16Y", "16-17Y"];
    readonly ADULTS: readonly ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
    readonly NUMERIC: readonly ["28", "30", "32", "34", "36", "38", "40", "42", "44", "46", "48"];
    readonly SHOES: {
        readonly KIDS: readonly ["6", "7", "8", "9", "10", "11", "12", "13", "1", "2", "3", "4", "5"];
        readonly ADULTS: readonly ["6", "7", "8", "9", "10", "11", "12", "13"];
    };
};
export declare const COLORS: {
    readonly WHITE: "White";
    readonly BLACK: "Black";
    readonly NAVY: "Navy Blue";
    readonly ROYAL: "Royal Blue";
    readonly SKY: "Sky Blue";
    readonly GREY: "Grey";
    readonly MAROON: "Maroon";
    readonly GREEN: "Green";
    readonly KHAKI: "Khaki";
    readonly BEIGE: "Beige";
    readonly BROWN: "Brown";
    readonly RED: "Red";
    readonly YELLOW: "Yellow";
    readonly PURPLE: "Purple";
    readonly ORANGE: "Orange";
    readonly PINK: "Pink";
};
export declare const PAYMENT_METHODS: {
    readonly CASH: "cash";
    readonly MPESA: "mpesa";
    readonly CARD: "card";
    readonly PESAPAL: "pesapal";
    readonly BANK_TRANSFER: "bank-transfer";
    readonly CREDIT: "credit";
};
export declare const PAYMENT_STATUS: {
    readonly PENDING: "pending";
    readonly PARTIAL: "partial";
    readonly PAID: "paid";
    readonly FAILED: "failed";
    readonly REFUNDED: "refunded";
};
export declare const SALE_STATUS: {
    readonly DRAFT: "draft";
    readonly CONFIRMED: "confirmed";
    readonly PAID: "paid";
    readonly CANCELLED: "cancelled";
    readonly REFUNDED: "refunded";
};
export declare const JOB_STATUS: {
    readonly PENDING: "pending";
    readonly IN_PROGRESS: "in-progress";
    readonly COMPLETED: "completed";
    readonly CANCELLED: "cancelled";
};
export declare const USER_ROLES: {
    readonly ADMIN: "admin";
    readonly MANAGER: "manager";
    readonly CASHIER: "cashier";
    readonly OWNER: "owner";
};
export declare const PERMISSIONS: {
    readonly SALES_CREATE: "sales.create";
    readonly SALES_EDIT: "sales.edit";
    readonly SALES_DELETE: "sales.delete";
    readonly SALES_VIEW: "sales.view";
    readonly INVENTORY_MANAGE: "inventory.manage";
    readonly CUSTOMERS_MANAGE: "customers.manage";
    readonly EMBROIDERY_MANAGE: "embroidery.manage";
    readonly PRINTING_MANAGE: "printing.manage";
    readonly REPORTS_VIEW: "reports.view";
    readonly SETTINGS_MANAGE: "settings.manage";
    readonly USERS_MANAGE: "users.manage";
};
export declare const ROLE_PERMISSIONS: {
    readonly admin: ("sales.create" | "sales.edit" | "sales.delete" | "sales.view" | "inventory.manage" | "customers.manage" | "embroidery.manage" | "printing.manage" | "reports.view" | "settings.manage" | "users.manage")[];
    readonly manager: readonly ["sales.create", "sales.edit", "sales.view", "inventory.manage", "customers.manage", "embroidery.manage", "printing.manage", "reports.view"];
    readonly cashier: readonly ["sales.create", "sales.view", "inventory.manage", "customers.manage"];
    readonly owner: ("sales.create" | "sales.edit" | "sales.delete" | "sales.view" | "inventory.manage" | "customers.manage" | "embroidery.manage" | "printing.manage" | "reports.view" | "settings.manage" | "users.manage")[];
};
export declare const EMBROIDERY_TYPES: {
    readonly LOGO: "logo";
    readonly TEXT: "text";
    readonly CUSTOM: "custom";
};
export declare const PRINTING_TYPES: {
    readonly SCREEN: "screen";
    readonly DIGITAL: "digital";
    readonly HEAT_TRANSFER: "heat-transfer";
};
export declare const GARMENT_TYPES: {
    readonly T_SHIRT: "t-shirt";
    readonly POLO: "polo";
    readonly HOODIE: "hoodie";
    readonly SWEATSHIRT: "sweatshirt";
    readonly JACKET: "jacket";
    readonly BLOUSE: "blouse";
    readonly SHIRT: "shirt";
    readonly TROUSERS: "trousers";
    readonly SKIRT: "skirt";
    readonly DRESS: "dress";
    readonly CAP: "cap";
    readonly BAG: "bag";
};
export declare const PRIORITIES: {
    readonly LOW: "low";
    readonly MEDIUM: "medium";
    readonly HIGH: "high";
};
export declare const TAX_SETTINGS: {
    readonly VAT_RATE: 0.16;
    readonly DEFAULT_TAX_RATE: 0.16;
};
export declare const BUSINESS_HOURS: {
    readonly WEEKDAYS: {
        readonly open: "08:00";
        readonly close: "18:00";
    };
    readonly SATURDAY: {
        readonly open: "08:00";
        readonly close: "16:00";
    };
    readonly SUNDAY: {
        readonly open: "closed";
        readonly close: "closed";
    };
};
export declare const RECEIPT_SETTINGS: {
    readonly WIDTH: 80;
    readonly HEADER_LINES: 5;
    readonly FOOTER_LINES: 3;
    readonly AUTO_PRINT: true;
    readonly COPIES: 1;
};
export declare const INVENTORY_SETTINGS: {
    readonly LOW_STOCK_THRESHOLD: 10;
    readonly AUTO_REORDER_POINT: 5;
    readonly STOCK_MOVEMENT_REASONS: {
        readonly SALE: "Sale";
        readonly PURCHASE: "Purchase";
        readonly RETURN: "Return";
        readonly ADJUSTMENT: "Stock Adjustment";
        readonly DAMAGE: "Damage";
        readonly TRANSFER: "Transfer";
        readonly PRODUCTION: "Production";
    };
};
export declare const API_ENDPOINTS: {
    readonly AUTH: {
        readonly LOGIN: "/api/auth/login";
        readonly LOGOUT: "/api/auth/logout";
        readonly REFRESH: "/api/auth/refresh";
        readonly PROFILE: "/api/auth/profile";
    };
    readonly PRODUCTS: "/api/products";
    readonly CUSTOMERS: "/api/customers";
    readonly SALES: "/api/sales";
    readonly INVENTORY: "/api/inventory";
    readonly EMBROIDERY: "/api/embroidery";
    readonly PRINTING: "/api/printing";
    readonly REPORTS: "/api/reports";
    readonly SETTINGS: "/api/settings";
    readonly USERS: "/api/users";
    readonly SYNC: "/api/sync";
    readonly PESAPAL: {
        readonly REQUEST_TOKEN: "/api/pesapal/request-token";
        readonly CREATE_ORDER: "/api/pesapal/create-order";
        readonly CALLBACK: "/api/pesapal/callback";
        readonly STATUS: "/api/pesapal/status";
    };
};
export declare const PESAPAL_CONFIG: {
    readonly BASE_URL: "https://pay.pesapal.com/v3";
    readonly SANDBOX_URL: "https://cybertest.pesapal.com/v3";
    readonly ENDPOINTS: {
        readonly GET_ACCESS_TOKEN: "/api/GetAccessToken";
        readonly POST_TRANSACTION: "/api/PostTransaction";
        readonly TRANSACTION_STATUS: "/api/GetTransactionStatus";
    };
    readonly TIMEOUT: 30000;
    readonly RETRY_ATTEMPTS: 3;
    readonly RETRY_DELAY: 1000;
};
export declare const SYNC_CONFIG: {
    readonly BATCH_SIZE: 100;
    readonly RETRY_ATTEMPTS: 3;
    readonly RETRY_DELAY: 5000;
    readonly SYNC_INTERVAL: 60000;
    readonly CONFLICT_RESOLUTION: "last-write-wins";
};
export declare const DATABASE_CONFIG: {
    readonly SQLITE: {
        readonly FILENAME: "pajoy.db";
        readonly BACKUP_INTERVAL: 3600000;
        readonly MAX_BACKUPS: 10;
    };
    readonly POSTGRESQL: {
        readonly MAX_CONNECTIONS: 20;
        readonly CONNECTION_TIMEOUT: 30000;
        readonly IDLE_TIMEOUT: 10000;
    };
};
export declare const ERROR_CODES: {
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK";
    readonly INVALID_PAYMENT: "INVALID_PAYMENT";
    readonly CUSTOMER_CREDIT_LIMIT: "CUSTOMER_CREDIT_LIMIT";
    readonly DUPLICATE_ORDER: "DUPLICATE_ORDER";
    readonly PESAPAL_TOKEN_ERROR: "PESAPAL_TOKEN_ERROR";
    readonly PESAPAL_PAYMENT_ERROR: "PESAPAL_PAYMENT_ERROR";
    readonly PESAPAL_CALLBACK_ERROR: "PESAPAL_CALLBACK_ERROR";
    readonly SYNC_ERROR: "SYNC_ERROR";
    readonly CONFLICT_ERROR: "CONFLICT_ERROR";
    readonly OFFLINE_MODE: "OFFLINE_MODE";
};
export declare const VALIDATION_RULES: {
    readonly PHONE: {
        readonly KENYA: RegExp;
        readonly MIN_LENGTH: 10;
        readonly MAX_LENGTH: 15;
    };
    readonly EMAIL: RegExp;
    readonly PASSWORD: {
        readonly MIN_LENGTH: 8;
        readonly REQUIRE_UPPERCASE: true;
        readonly REQUIRE_LOWERCASE: true;
        readonly REQUIRE_NUMBERS: true;
        readonly REQUIRE_SPECIAL: false;
    };
    readonly SKU: RegExp;
    readonly BARCODE: RegExp;
};
export declare const UI_CONFIG: {
    readonly THEME: {
        readonly PRIMARY_COLOR: "#3B82F6";
        readonly SECONDARY_COLOR: "#10B981";
        readonly ACCENT_COLOR: "#F59E0B";
        readonly BACKGROUND_COLOR: "#F9FAFB";
        readonly SURFACE_COLOR: "#FFFFFF";
        readonly TEXT_COLOR: "#111827";
        readonly TEXT_SECONDARY: "#6B7280";
        readonly BORDER_COLOR: "#E5E7EB";
        readonly ERROR_COLOR: "#EF4444";
        readonly SUCCESS_COLOR: "#10B981";
        readonly WARNING_COLOR: "#F59E0B";
    };
    readonly BREAKPOINTS: {
        readonly MOBILE: 640;
        readonly TABLET: 768;
        readonly DESKTOP: 1024;
        readonly LARGE_DESKTOP: 1280;
    };
    readonly ANIMATIONS: {
        readonly DURATION: {
            readonly FAST: 150;
            readonly NORMAL: 300;
            readonly SLOW: 500;
        };
        readonly EASING: {
            readonly EASE_IN_OUT: "cubic-bezier(0.4, 0, 0.2, 1)";
        };
    };
};
//# sourceMappingURL=index.d.ts.map
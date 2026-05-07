"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = void 0;
const auth_1 = __importDefault(require("./auth"));
const users_1 = __importDefault(require("./users"));
const products_1 = __importDefault(require("./products"));
const customers_1 = __importDefault(require("./customers"));
const sales_1 = __importDefault(require("./sales"));
const embroidery_1 = __importDefault(require("./embroidery"));
const printing_1 = __importDefault(require("./printing"));
const reports_1 = __importDefault(require("./reports"));
const pesapal_1 = __importDefault(require("./pesapal"));
const sync_1 = __importDefault(require("./sync"));
const settings_1 = __importDefault(require("./settings"));
const inventory_1 = __importDefault(require("./inventory"));
const setupRoutes = (app) => {
    // API versioning
    const API_VERSION = '/api/v1';
    // Health check (no versioning)
    app.get('/health', (req, res) => {
        res.status(200).json({
            success: true,
            message: 'PAJOY Backend API is running',
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime(),
        });
    });
    // API routes
    app.use(`${API_VERSION}/auth`, auth_1.default);
    app.use(`${API_VERSION}/users`, users_1.default);
    app.use(`${API_VERSION}/products`, products_1.default);
    app.use(`${API_VERSION}/customers`, customers_1.default);
    app.use(`${API_VERSION}/sales`, sales_1.default);
    app.use(`${API_VERSION}/embroidery`, embroidery_1.default);
    app.use(`${API_VERSION}/printing`, printing_1.default);
    app.use(`${API_VERSION}/reports`, reports_1.default);
    app.use(`${API_VERSION}/pesapal`, pesapal_1.default);
    app.use(`${API_VERSION}/sync`, sync_1.default);
    app.use(`${API_VERSION}/settings`, settings_1.default);
    app.use(`${API_VERSION}/inventory`, inventory_1.default);
    // Legacy API routes (for backward compatibility)
    app.use('/api/auth', auth_1.default);
    app.use('/api/users', users_1.default);
    app.use('/api/products', products_1.default);
    app.use('/api/customers', customers_1.default);
    app.use('/api/sales', sales_1.default);
    app.use('/api/embroidery', embroidery_1.default);
    app.use('/api/printing', printing_1.default);
    app.use('/api/reports', reports_1.default);
    app.use('/api/pesapal', pesapal_1.default);
    app.use('/api/sync', sync_1.default);
    app.use('/api/settings', settings_1.default);
    app.use('/api/inventory', inventory_1.default);
};
exports.setupRoutes = setupRoutes;
//# sourceMappingURL=index.js.map
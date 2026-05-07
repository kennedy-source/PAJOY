"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
}));
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'pajoy-backend' },
    transports: [
        // Write all logs to console
        new winston_1.default.transports.Console({
            format: consoleFormat,
        }),
    ],
    // Handle uncaught exceptions
    exceptionHandlers: [
        new winston_1.default.transports.Console({
            format: consoleFormat,
        }),
    ],
    // Handle unhandled promise rejections
    rejectionHandlers: [
        new winston_1.default.transports.Console({
            format: consoleFormat,
        }),
    ],
});
// Add file transport in production
if (process.env.NODE_ENV === 'production') {
    const logDir = path_1.default.dirname(process.env.LOG_FILE || 'logs/app.log');
    exports.logger.add(new winston_1.default.transports.File({
        filename: process.env.LOG_FILE || 'logs/app.log',
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }));
    exports.logger.add(new winston_1.default.transports.File({
        filename: path_1.default.join(logDir, 'error.log'),
        level: 'error',
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }));
}
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map
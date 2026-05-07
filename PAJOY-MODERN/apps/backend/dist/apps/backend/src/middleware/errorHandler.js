"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errors_1 = require("../types/errors");
const errorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let details = undefined;
    // Handle known application errors
    if (error instanceof errors_1.AppError) {
        statusCode = error.statusCode;
        message = error.message;
        details = error.details;
    }
    else if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        details = error.message;
    }
    else if (error.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    }
    else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
        statusCode = 503;
        message = 'Database service unavailable';
    }
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    else if (error.name === 'MulterError') {
        statusCode = 400;
        message = 'File upload error';
        details = error.message;
    }
    // Log error details
    logger_1.logger.error('Error occurred:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        statusCode,
    });
    // Send error response
    const errorResponse = {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
    };
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = error.stack;
        if (details) {
            errorResponse.details = details;
        }
    }
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    const error = {
        success: false,
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        timestamp: new Date().toISOString(),
    };
    logger_1.logger.warn('Route not found:', {
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
    });
    res.status(404).json(error);
};
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map
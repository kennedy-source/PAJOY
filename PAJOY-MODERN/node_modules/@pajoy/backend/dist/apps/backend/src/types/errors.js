"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncError = exports.PesapalError = exports.DatabaseError = exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    details;
    timestamp;
    constructor(message, statusCode = 500, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.timestamp = new Date();
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message, details) {
        super(message, 400, details);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends AppError {
    constructor(resource, id) {
        const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
        super(message, 404);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
class ConflictError extends AppError {
    constructor(message, details) {
        super(message, 409, details);
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
class DatabaseError extends AppError {
    constructor(message, details) {
        super(message, 503, details);
        this.name = 'DatabaseError';
    }
}
exports.DatabaseError = DatabaseError;
class PesapalError extends AppError {
    constructor(message, details) {
        super(message, 502, details);
        this.name = 'PesapalError';
    }
}
exports.PesapalError = PesapalError;
class SyncError extends AppError {
    constructor(message, details) {
        super(message, 500, details);
        this.name = 'SyncError';
    }
}
exports.SyncError = SyncError;
//# sourceMappingURL=errors.js.map
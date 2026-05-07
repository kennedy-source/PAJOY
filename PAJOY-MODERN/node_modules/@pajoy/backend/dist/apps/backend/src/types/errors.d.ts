export declare class AppError extends Error {
    statusCode: number;
    details?: any;
    timestamp: Date;
    constructor(message: string, statusCode?: number, details?: any);
}
export declare class ValidationError extends AppError {
    constructor(message: string, details?: any);
}
export declare class NotFoundError extends AppError {
    constructor(resource: string, id?: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class ConflictError extends AppError {
    constructor(message: string, details?: any);
}
export declare class DatabaseError extends AppError {
    constructor(message: string, details?: any);
}
export declare class PesapalError extends AppError {
    constructor(message: string, details?: any);
}
export declare class SyncError extends AppError {
    constructor(message: string, details?: any);
}
//# sourceMappingURL=errors.d.ts.map
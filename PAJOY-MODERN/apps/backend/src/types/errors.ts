export class AppError extends Error {
  public statusCode: number;
  public details?: any;
  public timestamp: Date;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, details);
    this.name = 'ConflictError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 503, details);
    this.name = 'DatabaseError';
  }
}

export class PesapalError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 502, details);
    this.name = 'PesapalError';
  }
}

export class SyncError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, details);
    this.name = 'SyncError';
  }
}

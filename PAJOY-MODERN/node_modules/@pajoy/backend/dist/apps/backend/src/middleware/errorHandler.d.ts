import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/errors';
export declare const errorHandler: (error: Error | AppError, req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map
import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { UnauthorizedError, ValidationError } from '../types/errors';
import { pgPool, sqliteDb } from '../database/connection';
import { USER_ROLES } from '@pajoy/constants';

const router = Router();

// Login endpoint
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }

  const { username, password } = req.body;

  // Find user in database
  const query = process.env.NODE_ENV === 'production' 
    ? 'SELECT * FROM users WHERE username = $1 AND is_active = true'
    : 'SELECT * FROM users WHERE username = ? AND is_active = 1';
  
  const params = process.env.NODE_ENV === 'production' ? [username] : [username];
  const user = process.env.NODE_ENV === 'production' 
    ? await pgPool.query(query, params)
    : sqliteDb.prepare(query).get(...params);

  if (!user || !(user as any).rows?.[0]) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const userData = (user as any).rows?.[0] || user;

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, userData.password_hash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: userData.id, 
      username: userData.username, 
      role: userData.role 
    },
    process.env.JWT_SECRET as string,
    { expiresIn: '24h' }
  );

  // Update last login
  const updateQuery = process.env.NODE_ENV === 'production'
    ? 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1'
    : 'UPDATE users SET last_login = datetime("now") WHERE id = ?';
  
  const updateParams = process.env.NODE_ENV === 'production' ? [userData.id] : [userData.id];
  
  if (process.env.NODE_ENV === 'production') {
    await pgPool.query(updateQuery, updateParams);
  } else {
    sqliteDb.prepare(updateQuery).run(...updateParams);
  }

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role,
        lastLogin: userData.last_login
      }
    },
    message: 'Login successful'
  });
}));

// Refresh token endpoint
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Generate new token
    const newToken = jwt.sign(
      { 
        userId: decoded.userId, 
        username: decoded.username, 
        role: decoded.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: { token: newToken },
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    throw new UnauthorizedError('Invalid token');
  }
}));

// Logout endpoint
router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  // In a real implementation, you might want to blacklist the token
  // For now, we'll just return success
  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

// Get current user profile
router.get('/profile', asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

  // Get user from database
  const query = process.env.NODE_ENV === 'production'
    ? 'SELECT id, username, email, first_name, last_name, role, last_login, created_at FROM users WHERE id = $1'
    : 'SELECT id, username, email, first_name, last_name, role, last_login, created_at FROM users WHERE id = ?';
  
  const params = process.env.NODE_ENV === 'production' ? [decoded.userId] : [decoded.userId];
  const user = process.env.NODE_ENV === 'production'
    ? await pgPool.query(query, params)
    : sqliteDb.prepare(query).get(...params);

  if (!user || !(user as any).rows?.[0]) {
    throw new UnauthorizedError('User not found');
  }

  const userData = (user as any).rows?.[0] || user;

  res.json({
    success: true,
    data: {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      firstName: userData.first_name,
      lastName: userData.last_name,
      role: userData.role,
      lastLogin: userData.last_login,
      createdAt: userData.created_at
    }
  });
}));

export default router;

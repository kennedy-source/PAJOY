"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const errorHandler_1 = require("../middleware/errorHandler");
const errors_1 = require("../types/errors");
const connection_1 = require("../database/connection");
const router = (0, express_1.Router)();
// Login endpoint
router.post('/login', [
    (0, express_validator_1.body)('username').notEmpty().withMessage('Username is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errors_1.ValidationError('Validation failed', errors.array());
    }
    const { username, password } = req.body;
    // Find user in database
    const query = process.env.NODE_ENV === 'production'
        ? 'SELECT * FROM users WHERE username = $1 AND is_active = true'
        : 'SELECT * FROM users WHERE username = ? AND is_active = 1';
    const params = process.env.NODE_ENV === 'production' ? [username] : [username];
    const user = process.env.NODE_ENV === 'production'
        ? await connection_1.pgPool.query(query, params)
        : connection_1.sqliteDb.prepare(query).get(...params);
    if (!user || !user.rows?.[0]) {
        throw new errors_1.UnauthorizedError('Invalid credentials');
    }
    const userData = user.rows?.[0] || user;
    // Verify password
    const isPasswordValid = await bcryptjs_1.default.compare(password, userData.password_hash);
    if (!isPasswordValid) {
        throw new errors_1.UnauthorizedError('Invalid credentials');
    }
    // Generate JWT token
    const token = jsonwebtoken_1.default.sign({
        userId: userData.id,
        username: userData.username,
        role: userData.role
    }, process.env.JWT_SECRET, { expiresIn: '24h' });
    // Update last login
    const updateQuery = process.env.NODE_ENV === 'production'
        ? 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1'
        : 'UPDATE users SET last_login = datetime("now") WHERE id = ?';
    const updateParams = process.env.NODE_ENV === 'production' ? [userData.id] : [userData.id];
    if (process.env.NODE_ENV === 'production') {
        await connection_1.pgPool.query(updateQuery, updateParams);
    }
    else {
        connection_1.sqliteDb.prepare(updateQuery).run(...updateParams);
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
router.post('/refresh', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new errors_1.UnauthorizedError('No token provided');
    }
    const token = authHeader.substring(7);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Generate new token
        const newToken = jsonwebtoken_1.default.sign({
            userId: decoded.userId,
            username: decoded.username,
            role: decoded.role
        }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({
            success: true,
            data: { token: newToken },
            message: 'Token refreshed successfully'
        });
    }
    catch (error) {
        throw new errors_1.UnauthorizedError('Invalid token');
    }
}));
// Logout endpoint
router.post('/logout', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return success
    res.json({
        success: true,
        message: 'Logout successful'
    });
}));
// Get current user profile
router.get('/profile', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new errors_1.UnauthorizedError('No token provided');
    }
    const token = authHeader.substring(7);
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    // Get user from database
    const query = process.env.NODE_ENV === 'production'
        ? 'SELECT id, username, email, first_name, last_name, role, last_login, created_at FROM users WHERE id = $1'
        : 'SELECT id, username, email, first_name, last_name, role, last_login, created_at FROM users WHERE id = ?';
    const params = process.env.NODE_ENV === 'production' ? [decoded.userId] : [decoded.userId];
    const user = process.env.NODE_ENV === 'production'
        ? await connection_1.pgPool.query(query, params)
        : connection_1.sqliteDb.prepare(query).get(...params);
    if (!user || !user.rows?.[0]) {
        throw new errors_1.UnauthorizedError('User not found');
    }
    const userData = user.rows?.[0] || user;
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
exports.default = router;
//# sourceMappingURL=auth.js.map
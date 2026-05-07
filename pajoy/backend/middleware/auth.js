const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'pajoy-secret';

function verifyJwt(token) {
  return jwt.verify(token, JWT_SECRET);
}

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  try {
    const payload = verifyJwt(token);
    const user = db.prepare('SELECT id, username, full_name, role, active FROM users WHERE id = ?').get(payload.userId);
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Unauthorized user' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = {
  verifyJwt,
  requireAuth
};

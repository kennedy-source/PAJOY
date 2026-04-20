const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const db = require('../db');
const { audit } = require('../services/audit');
const { validatePasswordStrength } = require('../services/password');

// Constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 15;
const SESSION_TIMEOUT_HOURS = 8;

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

  const u = db.prepare('SELECT * FROM users WHERE username = ? AND active = 1').get(username);
  if (!u) return res.status(401).json({ error: 'Invalid credentials' });

  // Check if account is locked
  if (u.locked_until && u.locked_until > Date.now()) {
    const remainingMinutes = Math.ceil((u.locked_until - Date.now()) / (1000 * 60));
    return res.status(423).json({ error: `Account locked. Try again in ${remainingMinutes} minutes` });
  }

  if (!bcrypt.compareSync(password, u.password_hash)) {
    // Increment login attempts
    const attempts = (u.login_attempts || 0) + 1;
    let locked_until = null;

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      locked_until = Date.now() + (LOCK_TIME_MINUTES * 60 * 1000);
    }

    db.prepare('UPDATE users SET login_attempts = ?, locked_until = ? WHERE id = ?')
      .run(attempts, locked_until, u.id);

    audit(u.id, 'failed_login', 'user', u.id, { attempts, ip: req.ip });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Reset login attempts on successful login
  db.prepare('UPDATE users SET login_attempts = 0, locked_until = NULL, last_login_at = ? WHERE id = ?')
    .run(Date.now(), u.id);

  // Generate session token
  const sessionToken = uuid();
  const sessionExpiresAt = Date.now() + (SESSION_TIMEOUT_HOURS * 60 * 60 * 1000);

  db.prepare('UPDATE users SET session_token = ?, session_expires_at = ? WHERE id = ?')
    .run(sessionToken, sessionExpiresAt, u.id);

  audit(u.id, 'login', 'user', u.id, { ip: req.ip });

  const { password_hash, session_token, session_expires_at, ...safe } = u;
  res.json({
    user: safe,
    token: sessionToken,
    requirePasswordChange: u.require_password_change === 1
  });
});

router.post('/validate-password', (req, res) => {
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: 'Password is required' });

  const validation = validatePasswordStrength(password);
  res.json(validation);
});

router.post('/logout', (req, res) => {
  const { userId } = req.body || {};
  if (userId) {
    db.prepare('UPDATE users SET session_token = NULL, session_expires_at = NULL WHERE id = ?')
      .run(userId);
    audit(userId, 'logout', 'user', userId);
  }
  res.json({ ok: true });
});

router.post('/change-password', (req, res) => {
  const { userId, oldPassword, newPassword, isFirstTime } = req.body || {};
  
  if (!userId || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Get user
  const user = db.prepare('SELECT * FROM users WHERE id = ? AND active = 1').get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // For first-time password change, don't validate old password
  if (!isFirstTime) {
    if (!oldPassword) {
      return res.status(400).json({ error: 'Current password required' });
    }
    
    if (!bcrypt.compareSync(oldPassword, user.password_hash)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
  }

  // Validate new password strength
  const validation = validatePasswordStrength(newPassword);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.message || 'Password does not meet requirements' });
  }

  // Update password
  const newPasswordHash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ?, password_changed_at = ?, require_password_change = 0, last_modified = ? WHERE id = ?')
    .run(newPasswordHash, Date.now(), Date.now(), userId);

  // Log the password change
  audit(userId, 'change_password', 'user', userId, { isFirstTime: !!isFirstTime });

  res.json({ ok: true, message: 'Password changed successfully' });
});

router.post('/validate-session', (req, res) => {
  const { userId, token } = req.body || {};
  if (!userId || !token) return res.status(400).json({ error: 'Missing session data' });

  const u = db.prepare('SELECT * FROM users WHERE id = ? AND active = 1').get(userId);
  if (!u || u.session_token !== token || (u.session_expires_at && u.session_expires_at < Date.now())) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  res.json({ valid: true, user: { ...u, password_hash: undefined, session_token: undefined } });
});

module.exports = router;

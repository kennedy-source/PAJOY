const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const db = require('../db');
const { audit } = require('../services/audit');

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT id,username,full_name,role,active,created_at,last_modified FROM users ORDER BY username').all();
  res.json(rows);
});
router.post('/', (req, res) => {
  const { username, full_name, password, role, actor } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return res.status(400).json({ error: 'Username already exists' });
  const id = uuid();
  db.prepare('INSERT INTO users (id,username,full_name,password_hash,role) VALUES (?,?,?,?,?)')
    .run(id, username, full_name || null, bcrypt.hashSync(password, 10), role || 'cashier');
  audit(actor, 'create_user', 'user', id, { username, role });
  res.json({ id });
});
router.put('/:id', (req, res) => {
  const { username, full_name, role, active, password, actor } = req.body;
  const updates = [];
  const params = [];
  if (username !== undefined) {
    if (!username) return res.status(400).json({ error: 'Username cannot be empty' });
    const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, req.params.id);
    if (existing) return res.status(400).json({ error: 'Username already exists' });
    updates.push('username=?'); params.push(username);
  }
  if (full_name !== undefined) { updates.push('full_name=?'); params.push(full_name); }
  if (role !== undefined) { updates.push('role=?'); params.push(role); }
  if (active !== undefined) { updates.push('active=?'); params.push(active ? 1 : 0); }
  if (password) { updates.push('password_hash=?'); params.push(bcrypt.hashSync(password, 10)); }
  updates.push('last_modified=?'); params.push(Date.now());
  params.push(req.params.id);
  db.prepare(`UPDATE users SET ${updates.join(',')} WHERE id=?`).run(...params);
  audit(actor, 'update_user', 'user', req.params.id);
  res.json({ ok: true });
});
router.get('/:id/security', (req, res) => {
  const user = db.prepare(`
    SELECT password_changed_at, login_attempts, locked_until, last_login_at, require_password_change
    FROM users WHERE id = ?
  `).get(req.params.id);

  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json(user);
});

module.exports = router;

const router = require('express').Router();
const { v4: uuid } = require('uuid');
const db = require('../db');
router.get('/', (req, res) => {
  const q = (req.query.q || '').trim();
  const rows = q
    ? db.prepare('SELECT * FROM customers WHERE name LIKE ? OR phone LIKE ? ORDER BY name').all(`%${q}%`, `%${q}%`)
    : db.prepare('SELECT * FROM customers ORDER BY name LIMIT 500').all();
  res.json(rows);
});
router.post('/', (req, res) => {
  const id = uuid();
  db.prepare('INSERT INTO customers (id,name,phone,email,notes) VALUES (?,?,?,?,?)')
    .run(id, req.body.name, req.body.phone || null, req.body.email || null, req.body.notes || null);
  res.json({ id });
});
router.put('/:id', (req, res) => {
  db.prepare('UPDATE customers SET name=?, phone=?, email=?, notes=?, last_modified=? WHERE id=?')
    .run(req.body.name, req.body.phone, req.body.email, req.body.notes, Date.now(), req.params.id);
  res.json({ ok: true });
});
router.get('/:id/sales', (req, res) => {
  res.json(db.prepare('SELECT * FROM sales WHERE customer_id=? ORDER BY created_at DESC LIMIT 100').all(req.params.id));
});
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM customers WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});
module.exports = router;

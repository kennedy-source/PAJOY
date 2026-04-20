const router = require('express').Router();
const { v4: uuid } = require('uuid');
const db = require('../db');
router.get('/', (_req, res) => res.json(db.prepare('SELECT * FROM suppliers ORDER BY name').all()));
router.post('/', (req, res) => {
  const id = uuid();
  db.prepare('INSERT INTO suppliers (id,name,contact,phone,email,category,notes) VALUES (?,?,?,?,?,?,?)')
    .run(id, req.body.name, req.body.contact, req.body.phone, req.body.email, req.body.category, req.body.notes);
  res.json({ id });
});
router.put('/:id', (req, res) => {
  db.prepare('UPDATE suppliers SET name=?, contact=?, phone=?, email=?, category=?, notes=?, last_modified=? WHERE id=?')
    .run(req.body.name, req.body.contact, req.body.phone, req.body.email, req.body.category, req.body.notes, Date.now(), req.params.id);
  res.json({ ok: true });
});
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM suppliers WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});
module.exports = router;

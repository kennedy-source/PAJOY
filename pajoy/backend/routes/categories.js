const router = require('express').Router();
const { v4: uuid } = require('uuid');
const db = require('../db');
router.get('/', (_req, res) => {
  res.json(db.prepare('SELECT * FROM categories ORDER BY sort_order, name').all());
});
router.post('/', (req, res) => {
  const id = uuid();
  db.prepare('INSERT INTO categories (id,name,parent_id,sort_order) VALUES (?,?,?,?)')
    .run(id, req.body.name, req.body.parent_id || null, req.body.sort_order || 0);
  res.json({ id });
});
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM categories WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});
module.exports = router;

const router = require('express').Router();
const { v4: uuid } = require('uuid');
const db = require('../db');
const { audit } = require('../services/audit');

router.get('/', (_req, res) => res.json(db.prepare('SELECT * FROM expenses ORDER BY date DESC LIMIT 500').all()));
router.post('/', (req, res) => {
  const id = uuid();
  db.prepare('INSERT INTO expenses (id,category,amount,description,date,user_id) VALUES (?,?,?,?,?,?)')
    .run(id, req.body.category, req.body.amount, req.body.description || null, req.body.date || Date.now(), req.body.user_id || null);
  audit(req.body.actor, 'create_expense', 'expense', id);
  res.json({ id });
});
router.put('/:id/approve', (req, res) => {
  const { status, actor } = req.body;
  if (!['approved','rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  db.prepare('UPDATE expenses SET status=?, approved_by=?, last_modified=? WHERE id=?')
    .run(status, actor, Date.now(), req.params.id);
  audit(actor, 'approve_expense', 'expense', req.params.id, { status });
  res.json({ ok: true });
});
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM expenses WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});
module.exports = router;

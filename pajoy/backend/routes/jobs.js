const router = require('express').Router();
const { v4: uuid } = require('uuid');
const db = require('../db');
const { audit } = require('../services/audit');

router.get('/', (_req, res) => {
  const rows = db.prepare(`
    SELECT j.*, p.name AS product_name, v.price, u.username AS assigned_username
    FROM jobs j
    LEFT JOIN products p ON p.id=j.product_id
    LEFT JOIN variants v ON v.id=j.variant_id
    LEFT JOIN users u ON u.id=j.assigned_to
    ORDER BY j.created_at DESC LIMIT 500
  `).all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const id = uuid();
  const { product_id, variant_id, quantity, assigned_to, notes, actor } = req.body;
  db.prepare('INSERT INTO jobs (id,product_id,variant_id,quantity,assigned_to,notes) VALUES (?,?,?,?,?,?)')
    .run(id, product_id, variant_id || null, quantity, assigned_to || null, notes || null);
  audit(actor, 'create_job', 'job', id);
  res.json({ id });
});

router.put('/:id/status', (req, res) => {
  const { status, actor } = req.body;
  if (!['pending','in_progress','completed','cancelled'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  db.prepare('UPDATE jobs SET status=?, last_modified=? WHERE id=?')
    .run(status, Date.now(), req.params.id);
  audit(actor, 'update_job_status', 'job', req.params.id, { status });
  res.json({ ok: true });
});

module.exports = router;
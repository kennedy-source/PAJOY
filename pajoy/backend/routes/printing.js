const router = require('express').Router();
const { v4: uuid } = require('uuid');
const db = require('../db');

router.get('/', (_req, res) => {
  res.json(db.prepare(`
    SELECT p.*, c.name AS customer_name, u.full_name AS assigned_name
    FROM print_jobs p
    LEFT JOIN customers c ON c.id=p.customer_id
    LEFT JOIN users u ON u.id=p.assigned_to
    ORDER BY p.created_at DESC LIMIT 500
  `).all());
});
router.post('/', (req, res) => {
  const id = uuid();
  const c = db.prepare('SELECT COUNT(*) AS c FROM print_jobs').get().c;
  const job_no = `PRT-${String(Date.now()).slice(-5)}-${String(c + 1).padStart(4, '0')}`;
  const { customer_id, print_type, garment, design_notes, qty, unit_cost, due_date, assigned_to } = req.body;
  const total_cost = (qty || 1) * (unit_cost || 0);
  db.prepare(`INSERT INTO print_jobs (id,job_no,customer_id,print_type,garment,design_notes,qty,unit_cost,total_cost,due_date,assigned_to)
              VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, job_no, customer_id || null, print_type, garment, design_notes, qty || 1, unit_cost || 0, total_cost, due_date || null, assigned_to || null);
  res.json({ id, job_no });
});
router.put('/:id/status', (req, res) => {
  db.prepare('UPDATE print_jobs SET status=?, last_modified=? WHERE id=?').run(req.body.status, Date.now(), req.params.id);
  res.json({ ok: true });
});
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM print_jobs WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});
module.exports = router;

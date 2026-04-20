const router = require('express').Router();
const { v4: uuid } = require('uuid');
const db = require('../db');

function nextJobNo(prefix) {
  const c = db.prepare(`SELECT COUNT(*) AS c FROM ${prefix === 'EMB' ? 'embroidery_jobs' : 'print_jobs'}`).get().c;
  return `${prefix}-${String(Date.now()).slice(-5)}-${String(c + 1).padStart(4, '0')}`;
}

router.get('/', (_req, res) => {
  res.json(db.prepare(`
    SELECT e.*, c.name AS customer_name, s.name AS school_name, u.full_name AS assigned_name
    FROM embroidery_jobs e
    LEFT JOIN customers c ON c.id=e.customer_id
    LEFT JOIN schools s ON s.id=e.school_id
    LEFT JOIN users u ON u.id=e.assigned_to
    ORDER BY e.created_at DESC LIMIT 500
  `).all());
});
router.post('/', (req, res) => {
  const id = uuid();
  const job_no = nextJobNo('EMB');
  const { customer_id, school_id, garment, design_notes, thread_colours, placement, qty, unit_cost, due_date, assigned_to } = req.body;
  const total_cost = (qty || 1) * (unit_cost || 0);
  db.prepare(`INSERT INTO embroidery_jobs (id,job_no,customer_id,school_id,garment,design_notes,thread_colours,placement,qty,unit_cost,total_cost,due_date,assigned_to)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, job_no, customer_id || null, school_id || null, garment, design_notes, thread_colours, placement,
         qty || 1, unit_cost || 0, total_cost, due_date || null, assigned_to || null);
  res.json({ id, job_no });
});
router.put('/:id/status', (req, res) => {
  db.prepare('UPDATE embroidery_jobs SET status=?, last_modified=? WHERE id=?').run(req.body.status, Date.now(), req.params.id);
  res.json({ ok: true });
});
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM embroidery_jobs WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});
module.exports = router;

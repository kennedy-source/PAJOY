const router = require('express').Router();
const { v4: uuid } = require('uuid');
const db = require('../db');
const { audit } = require('../services/audit');

router.post('/', (req, res) => {
  const id = uuid();
  const { product_id, size_id, colour_id, gender, barcode, price, cost_price, stock_qty, reorder_level, actor } = req.body;
  db.prepare(`INSERT INTO variants (id,product_id,size_id,colour_id,gender,barcode,price,cost_price,stock_qty,reorder_level)
              VALUES (?,?,?,?,?,?,?,?,?,?)`)
    .run(id, product_id, size_id || null, colour_id || null, gender || null, barcode || null,
         price || 0, cost_price || 0, stock_qty || 0, reorder_level || 5);
  if (stock_qty) {
    db.prepare('INSERT INTO inventory_logs (id,variant_id,change_qty,reason,user_id) VALUES (?,?,?,?,?)')
      .run(uuid(), id, stock_qty, 'restock', actor || null);
  }
  audit(actor, 'create_variant', 'variant', id);
  res.json({ id });
});

router.put('/:id', (req, res) => {
  const fields = ['size_id','colour_id','gender','barcode','price','cost_price','stock_qty','reorder_level'];
  const sets = fields.filter(f => req.body[f] !== undefined).map(f => `${f}=@${f}`).join(',');
  if (!sets) return res.json({ ok: true });
  db.prepare(`UPDATE variants SET ${sets}, last_modified=@last_modified WHERE id=@id`)
    .run({ ...req.body, id: req.params.id, last_modified: Date.now() });
  res.json({ ok: true });
});

router.post('/:id/adjust', (req, res) => {
  const { change_qty, reason, actor } = req.body;
  const v = db.prepare('SELECT stock_qty FROM variants WHERE id=?').get(req.params.id);
  if (!v) return res.status(404).json({ error: 'Variant not found' });
  db.prepare('UPDATE variants SET stock_qty=stock_qty+?, last_modified=? WHERE id=?')
    .run(change_qty, Date.now(), req.params.id);
  db.prepare('INSERT INTO inventory_logs (id,variant_id,change_qty,reason,user_id) VALUES (?,?,?,?,?)')
    .run(uuid(), req.params.id, change_qty, reason || 'adjustment', actor || null);
  res.json({ ok: true });
});

router.get('/:id/movements', (req, res) => {
  res.json(db.prepare('SELECT * FROM inventory_logs WHERE variant_id=? ORDER BY created_at DESC LIMIT 200')
    .all(req.params.id));
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM variants WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

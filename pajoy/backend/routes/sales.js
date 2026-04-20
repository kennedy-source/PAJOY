const router = require('express').Router();
const { v4: uuid } = require('uuid');
const db = require('../db');
const { audit, syncLog } = require('../services/audit');

function nextReceiptNo() {
  const row = db.prepare("SELECT COUNT(*) AS c FROM sales").get();
  const n = (row.c || 0) + 1;
  return 'PJY-' + String(Date.now()).slice(-6) + '-' + String(n).padStart(4, '0');
}

router.get('/', (req, res) => {
  const limit = Math.min(+req.query.limit || 100, 500);
  const rows = db.prepare(`
    SELECT s.*, c.name AS customer_name, u.full_name AS cashier_name
    FROM sales s
    LEFT JOIN customers c ON c.id=s.customer_id
    LEFT JOIN users u ON u.id=s.cashier_id
    ORDER BY s.created_at DESC LIMIT ?
  `).all(limit);
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const sale = db.prepare(`
    SELECT s.*, c.name AS customer_name, c.phone AS customer_phone, u.full_name AS cashier_name
    FROM sales s
    LEFT JOIN customers c ON c.id=s.customer_id
    LEFT JOIN users u ON u.id=s.cashier_id
    WHERE s.id=?`).get(req.params.id);
  if (!sale) return res.status(404).json({ error: 'Not found' });
  const items = db.prepare('SELECT * FROM sale_items WHERE sale_id=?').all(req.params.id);
  res.json({ ...sale, items });
});

router.post('/', (req, res) => {
  const { items, discount = 0, tax = 0, payment_method, cash_amount = 0, mpesa_amount = 0,
          mpesa_ref, customer_id, cashier_id, notes } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'Cart is empty' });

  const tx = db.transaction(() => {
    const subtotal = items.reduce((s, it) => s + it.qty * it.unit_price, 0);
    const total = Math.max(0, subtotal - discount + tax);
    const id = uuid();
    const receipt_no = nextReceiptNo();
    db.prepare(`INSERT INTO sales (id,receipt_no,customer_id,cashier_id,subtotal,discount,tax,total,
                                   payment_method,cash_amount,mpesa_amount,mpesa_ref,notes)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, receipt_no, customer_id || null, cashier_id || null,
           subtotal, discount, tax, total, payment_method || 'cash',
           cash_amount, mpesa_amount, mpesa_ref || null, notes || null);

    const insertItem = db.prepare(`INSERT INTO sale_items (id,sale_id,variant_id,product_id,name_snapshot,qty,unit_price,line_total)
                                   VALUES (?,?,?,?,?,?,?,?)`);
    const decStock   = db.prepare('UPDATE variants SET stock_qty=stock_qty-?, last_modified=? WHERE id=?');
    const invLog     = db.prepare('INSERT INTO inventory_logs (id,variant_id,change_qty,reason,ref_id,user_id) VALUES (?,?,?,?,?,?)');

    for (const it of items) {
      insertItem.run(uuid(), id, it.variant_id || null, it.product_id || null,
                     it.name, it.qty, it.unit_price, it.qty * it.unit_price);
      if (it.variant_id) {
        decStock.run(it.qty, Date.now(), it.variant_id);
        invLog.run(uuid(), it.variant_id, -it.qty, 'sale', id, cashier_id || null);
      }
    }
    audit(cashier_id, 'create_sale', 'sale', id, { receipt_no, total });
    syncLog('sales', id, 'insert', { receipt_no, total });
    return { id, receipt_no, total };
  });

  try {
    res.json(tx());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/:id/refund', (req, res) => {
  const sale = db.prepare('SELECT * FROM sales WHERE id=?').get(req.params.id);
  if (!sale) return res.status(404).json({ error: 'Not found' });
  const items = db.prepare('SELECT * FROM sale_items WHERE sale_id=?').all(req.params.id);
  const tx = db.transaction(() => {
    db.prepare('UPDATE sales SET status=?, last_modified=? WHERE id=?').run('refunded', Date.now(), req.params.id);
    for (const it of items) {
      if (it.variant_id) {
        db.prepare('UPDATE variants SET stock_qty=stock_qty+?, last_modified=? WHERE id=?')
          .run(it.qty, Date.now(), it.variant_id);
        db.prepare('INSERT INTO inventory_logs (id,variant_id,change_qty,reason,ref_id) VALUES (?,?,?,?,?)')
          .run(uuid(), it.variant_id, it.qty, 'refund', req.params.id);
      }
    }
    audit(req.body.actor, 'refund_sale', 'sale', req.params.id);
  });
  tx();
  res.json({ ok: true });
});

module.exports = router;

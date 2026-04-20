const router = require('express').Router();
const { v4: uuid } = require('uuid');
const db = require('../db');
const { audit, syncLog } = require('../services/audit');

router.get('/', (req, res) => {
  const q = (req.query.q || '').trim();
  const sku = (req.query.sku || '').trim();
  const schoolId = req.query.school_id;
  const categoryId = req.query.category_id;
  let sql = `SELECT p.*, c.name AS category_name, s.name AS school_name,
                    (SELECT COALESCE(SUM(stock_qty),0) FROM variants v WHERE v.product_id=p.id) AS total_stock
             FROM products p
             LEFT JOIN categories c ON c.id=p.category_id
             LEFT JOIN schools s ON s.id=p.school_id
             WHERE p.active=1`;
  const params = [];
  if (q) { sql += ' AND (p.name LIKE ? OR p.sku LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
  if (sku) { sql += ' AND p.sku LIKE ?'; params.push(`%${sku}%`); }
  if (schoolId) { sql += ' AND p.school_id=?'; params.push(schoolId); }
  if (categoryId) { sql += ' AND p.category_id=?'; params.push(categoryId); }
  sql += ' ORDER BY p.name LIMIT 500';
  res.json(db.prepare(sql).all(...params));
});

router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  const variants = db.prepare(`
    SELECT v.*, s.label AS size_label, c.name AS colour_name, c.hex AS colour_hex
    FROM variants v
    LEFT JOIN sizes s ON s.id=v.size_id
    LEFT JOIN colours c ON c.id=v.colour_id
    WHERE v.product_id=? ORDER BY s.sort_order, c.name
  `).all(req.params.id);
  res.json({ ...product, variants });
});

router.post('/', (req, res) => {
  const id = uuid();
  const { sku, name, description, category_id, school_id, base_price, cost_price, reorder_level, actor } = req.body;
  const finalSku = sku || ('PJY-' + Date.now().toString(36).toUpperCase());
  db.prepare(`INSERT INTO products (id,sku,name,description,category_id,school_id,base_price,cost_price,reorder_level)
              VALUES (?,?,?,?,?,?,?,?,?)`)
    .run(id, finalSku, name, description || null, category_id || null, school_id || null,
         base_price || 0, cost_price || 0, reorder_level || 5);
  audit(actor, 'create_product', 'product', id);
  syncLog('products', id, 'insert', req.body);
  res.json({ id, sku: finalSku });
});

router.put('/:id', (req, res) => {
  const fields = ['sku','name','description','category_id','school_id','base_price','cost_price','reorder_level','active'];
  const sets = fields.filter(f => req.body[f] !== undefined).map(f => `${f}=@${f}`).join(',');
  if (!sets) return res.json({ ok: true });
  db.prepare(`UPDATE products SET ${sets}, last_modified=@last_modified WHERE id=@id`)
    .run({ ...req.body, id: req.params.id, last_modified: Date.now() });
  syncLog('products', req.params.id, 'update', req.body);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('UPDATE products SET active=0, last_modified=? WHERE id=?').run(Date.now(), req.params.id);
  res.json({ ok: true });
});

router.get('/meta/low-stock', (_req, res) => {
  const rows = db.prepare(`
    SELECT p.id, p.name, p.sku, p.reorder_level,
           COALESCE(SUM(v.stock_qty),0) AS total_stock
    FROM products p LEFT JOIN variants v ON v.product_id=p.id
    WHERE p.active=1
    GROUP BY p.id
    HAVING total_stock <= p.reorder_level
    ORDER BY total_stock ASC LIMIT 50
  `).all();
  res.json(rows);
});

module.exports = router;

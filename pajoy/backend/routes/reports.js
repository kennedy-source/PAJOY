const router = require('express').Router();
const db = require('../db');

router.get('/summary', (_req, res) => {
  const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
  const start = startOfDay.getTime();
  const today = db.prepare("SELECT COALESCE(SUM(total),0) AS t, COUNT(*) AS n FROM sales WHERE status='completed' AND created_at >= ?").get(start);
  const week  = db.prepare("SELECT COALESCE(SUM(total),0) AS t FROM sales WHERE status='completed' AND created_at >= ?").get(start - 6*86400000);
  const month = db.prepare("SELECT COALESCE(SUM(total),0) AS t FROM sales WHERE status='completed' AND created_at >= ?").get(start - 29*86400000);
  const lowStock = db.prepare(`
    SELECT COUNT(*) AS c FROM (
      SELECT p.id FROM products p LEFT JOIN variants v ON v.product_id=p.id
      WHERE p.active=1 GROUP BY p.id HAVING COALESCE(SUM(v.stock_qty),0) <= p.reorder_level
    )`).get();
  const pendEmb = db.prepare("SELECT COUNT(*) AS c FROM embroidery_jobs WHERE status NOT IN ('completed','cancelled')").get();
  const pendPrt = db.prepare("SELECT COUNT(*) AS c FROM print_jobs WHERE status NOT IN ('completed','cancelled')").get();
  const recent = db.prepare(`SELECT s.id,s.receipt_no,s.total,s.created_at,s.payment_method,c.name AS customer_name
                             FROM sales s LEFT JOIN customers c ON c.id=s.customer_id
                             ORDER BY s.created_at DESC LIMIT 8`).all();
  res.json({
    today_sales: today.t, today_count: today.n,
    week_sales: week.t, month_sales: month.t,
    low_stock_count: lowStock.c,
    pending_embroidery: pendEmb.c, pending_printing: pendPrt.c,
    recent
  });
});

router.get('/sales-trend', (req, res) => {
  const days = Math.min(+req.query.days || 14, 60);
  const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const from = startOfDay.getTime() - i * 86400000;
    const to = from + 86400000;
    const r = db.prepare("SELECT COALESCE(SUM(total),0) AS t FROM sales WHERE status='completed' AND created_at>=? AND created_at<?").get(from, to);
    out.push({ date: new Date(from).toISOString().slice(5,10), total: r.t });
  }
  res.json(out);
});

router.get('/top-items', (_req, res) => {
  res.json(db.prepare(`
    SELECT name_snapshot AS name, SUM(qty) AS qty, SUM(line_total) AS revenue
    FROM sale_items GROUP BY name_snapshot ORDER BY revenue DESC LIMIT 10
  `).all());
});

router.get('/sales-by-category', (_req, res) => {
  res.json(db.prepare(`
    SELECT COALESCE(c.name,'Uncategorized') AS category, SUM(si.line_total) AS revenue
    FROM sale_items si
    LEFT JOIN products p ON p.id=si.product_id
    LEFT JOIN categories c ON c.id=p.category_id
    GROUP BY category ORDER BY revenue DESC
  `).all());
});

router.get('/profit-estimate', (req, res) => {
  const days = +req.query.days || 30;
  const since = Date.now() - days * 86400000;
  const sales = db.prepare("SELECT COALESCE(SUM(total),0) AS t FROM sales WHERE status='completed' AND created_at>=?").get(since).t;
  const cogs = db.prepare(`
    SELECT COALESCE(SUM(si.qty * COALESCE(v.cost_price, p.cost_price, 0)),0) AS c
    FROM sale_items si
    LEFT JOIN variants v ON v.id=si.variant_id
    LEFT JOIN products p ON p.id=si.product_id
    JOIN sales s ON s.id=si.sale_id
    WHERE s.status='completed' AND s.created_at>=?`).get(since).c;
  const expenses = db.prepare("SELECT COALESCE(SUM(amount),0) AS a FROM expenses WHERE date>=?").get(since).a;
  res.json({ revenue: sales, cogs, gross_profit: sales - cogs, expenses, net_profit: sales - cogs - expenses, days });
});

module.exports = router;

const router = require('express').Router();
const db = require('../db');
router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM settings').all();
  const obj = {};
  rows.forEach(r => { obj[r.key] = r.value; });
  res.json(obj);
});
router.put('/', (req, res) => {
  const upsert = db.prepare('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
  for (const [k,v] of Object.entries(req.body || {})) upsert.run(k, String(v));
  res.json({ ok: true });
});
module.exports = router;

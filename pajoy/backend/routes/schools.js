const router = require('express').Router();
const { v4: uuid } = require('uuid');
const db = require('../db');
const { audit, syncLog } = require('../services/audit');

router.get('/', (req, res) => {
  const q = (req.query.q || '').trim();
  const rows = q
    ? db.prepare('SELECT * FROM schools WHERE name LIKE ? OR county LIKE ? ORDER BY name').all(`%${q}%`, `%${q}%`)
    : db.prepare('SELECT * FROM schools ORDER BY name').all();
  res.json(rows);
});
router.post('/', (req, res) => {
  const id = uuid();
  const { name, county, level, gender, code, primary_color, secondary_color, notes, actor } = req.body;
  db.prepare(`INSERT INTO schools (id,name,county,level,gender,code,primary_color,secondary_color,notes)
              VALUES (?,?,?,?,?,?,?,?,?)`)
    .run(id, name, county, level, gender, code, primary_color, secondary_color, notes);
  audit(actor, 'create_school', 'school', id);
  syncLog('schools', id, 'insert', req.body);
  res.json({ id });
});
router.put('/:id', (req, res) => {
  const fields = ['name','county','level','gender','code','primary_color','secondary_color','notes','active'];
  const sets = fields.filter(f => req.body[f] !== undefined).map(f => `${f}=@${f}`).join(',');
  if (!sets) return res.json({ ok: true });
  db.prepare(`UPDATE schools SET ${sets}, last_modified=@last_modified WHERE id=@id`)
    .run({ ...req.body, id: req.params.id, last_modified: Date.now() });
  syncLog('schools', req.params.id, 'update', req.body);
  res.json({ ok: true });
});
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM schools WHERE id=?').run(req.params.id);
  syncLog('schools', req.params.id, 'delete', null);
  res.json({ ok: true });
});
module.exports = router;

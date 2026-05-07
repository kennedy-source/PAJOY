const router = require('express').Router();
const { v4: uuid } = require('uuid');
const db = require('../db');
const { audit } = require('../services/audit');

router.post('/upload', (req, res) => {
  const { deviceId, entity, op, payload } = req.body;
  if (!deviceId || !entity || !op || !payload) {
    return res.status(400).json({ error: 'Missing sync payload' });
  }

  const id = uuid();
  db.prepare(`INSERT INTO sync_logs (id, entity, entity_id, op, payload, device_id, created_at, synced)
              VALUES (?, ?, ?, ?, ?, ?, datetime('now'), 0)`)
    .run(id, entity, payload.id || null, op, JSON.stringify(payload), deviceId);

  audit(null, 'sync_upload', 'sync', id, { deviceId, entity, op });
  res.json({ ok: true, id });
});

router.get('/download', (req, res) => {
  const since = Number(req.query.since || 0);
  const entity = req.query.entity;
  const deviceId = req.query.deviceId;

  let query = 'SELECT * FROM sync_logs WHERE created_at > ?';
  const params = [since];
  if (entity) {
    query += ' AND entity = ?';
    params.push(entity);
  }
  if (deviceId) {
    query += ' AND device_id != ?';
    params.push(deviceId);
  }
  query += ' ORDER BY created_at ASC LIMIT 500';

  const rows = db.prepare(query).all(...params);
  res.json({
    ok: true,
    since,
    count: rows.length,
    changes: rows.map(row => ({
      id: row.id,
      entity: row.entity,
      entityId: row.entity_id,
      op: row.op,
      payload: row.payload ? JSON.parse(row.payload) : null,
      deviceId: row.device_id,
      createdAt: row.created_at,
      synced: !!row.synced
    }))
  });
});

router.post('/mark-synced', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || !ids.length) {
    return res.status(400).json({ error: 'Missing ids list' });
  }

  const placeholders = ids.map(() => '?').join(',');
  const result = db.prepare(`UPDATE sync_logs SET synced = 1 WHERE id IN (${placeholders})`).run(...ids);
  res.json({ ok: true, updated: result.changes });
});

module.exports = router;

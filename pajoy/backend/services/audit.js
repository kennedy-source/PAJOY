const { v4: uuid } = require('uuid');
const db = require('../db');
function audit(userId, action, entity, entityId, meta) {
  db.prepare(`INSERT INTO audit_logs (id,user_id,action,entity,entity_id,meta) VALUES (?,?,?,?,?,?)`)
    .run(uuid(), userId || null, action, entity || null, entityId || null, meta ? JSON.stringify(meta) : null);
}
function syncLog(entity, entityId, op, payload) {
  db.prepare(`INSERT INTO sync_logs (entity,entity_id,op,payload,device_id) VALUES (?,?,?,?,?)`)
    .run(entity, entityId, op, payload ? JSON.stringify(payload) : null, 'local');
}
module.exports = { audit, syncLog };

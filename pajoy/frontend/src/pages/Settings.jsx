import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';

export default function Settings() {
  const [s, setS] = useState({});
  const [msg, setMsg] = useState('');
  useEffect(() => { api.get('/api/settings').then(setS); }, []);
  async function save() { await api.put('/api/settings', s); setMsg('Saved ✓'); setTimeout(() => setMsg(''), 2000); }
  async function backup() {
    if (!window.pajoy?.backup) return alert('Backup is only available in the desktop app.');
    const r = await window.pajoy.backup();
    if (r.ok) alert('Backup saved to:\n' + r.filePath);
  }
  async function restore() {
    if (!window.pajoy?.restore) return alert('Restore is only available in the desktop app.');
    if (!confirm('This will replace your current database. Continue?')) return;
    const r = await window.pajoy.restore();
    if (r.ok) alert('Restored. Please restart the app.');
  }
  return (
    <>
      <h1>Settings</h1>
      <div className="page-sub">Shop details and backup</div>
      <div className="card" style={{ maxWidth: 640 }}>
        <h3>Shop details</h3>
        <div className="field"><label className="label">Shop name</label><input className="input" value={s.shop_name || ''} onChange={e => setS({ ...s, shop_name: e.target.value })} /></div>
        <div className="field"><label className="label">Address</label><input className="input" value={s.shop_address || ''} onChange={e => setS({ ...s, shop_address: e.target.value })} /></div>
        <div className="row">
          <div className="field"><label className="label">Phone</label><input className="input" value={s.shop_phone || ''} onChange={e => setS({ ...s, shop_phone: e.target.value })} /></div>
          <div className="field"><label className="label">Currency</label><input className="input" value={s.currency || 'KES'} onChange={e => setS({ ...s, currency: e.target.value })} /></div>
        </div>
        <button className="btn primary" onClick={save}>Save</button>
        {msg && <span className="badge success" style={{ marginLeft: 10 }}>{msg}</span>}
      </div>

      <div className="card mt-16" style={{ maxWidth: 640 }}>
        <h3>Backup & restore</h3>
        <div className="text-mute mb-12">Local SQLite backups. Available only inside the desktop app.</div>
        <div className="flex gap-8">
          <button className="btn" onClick={backup}>📦 Backup database</button>
          <button className="btn danger" onClick={restore}>↺ Restore from file</button>
        </div>
      </div>
    </>
  );
}

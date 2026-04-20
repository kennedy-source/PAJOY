import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { downloadCsv } from '../services/export.js';
import Modal from '../components/Modal.jsx';

export default function Schools() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', county: '', level: 'secondary', gender: 'mixed', code: '', primary_color: '', secondary_color: '', notes: '' });
  const [editing, setEditing] = useState(null);

  function load() {
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';
    api.get('/api/schools' + qs).then(setItems);
  }
  useEffect(() => { load(); }, [q]);

  async function save() {
    if (!form.name) return;
    if (editing) {
      await api.put('/api/schools/' + editing.id, form);
      setEditing(null);
    } else {
      await api.post('/api/schools', form);
      setShowAdd(false);
    }
    setForm({ name: '', county: '', level: 'secondary', gender: 'mixed', code: '', primary_color: '', secondary_color: '', notes: '' });
    load();
  }

  function edit(item) {
    setEditing(item);
    setForm({
      name: item.name,
      county: item.county || '',
      level: item.level,
      gender: item.gender,
      code: item.code || '',
      primary_color: item.primary_color || '',
      secondary_color: item.secondary_color || '',
      notes: item.notes || ''
    });
  }

  return (
    <>
      <div className="flex between center mb-16">
        <div><h1>Schools</h1><div className="page-sub">{items.length} schools</div></div>
        <div className="flex gap-8">
          <input className="input" placeholder="Search schools…" value={q} onChange={e => setQ(e.target.value)} style={{ width: 280 }} />
          <button className="btn" onClick={() => downloadCsv('schools.csv', items, [
            { key: 'name', label: 'Name' },
            { key: 'county', label: 'County' },
            { key: 'level', label: 'Level' },
            { key: 'gender', label: 'Gender' },
            { key: 'primary_color', label: 'Primary colour' },
            { key: 'secondary_color', label: 'Secondary colour' }
          ])}>Export CSV</button>
          <button className="btn primary" onClick={() => setShowAdd(true)}>+ New school</button>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>Name</th><th>County</th><th>Level</th><th>Gender</th><th>Colours</th><th></th></tr></thead>
          <tbody>
            {items.map(s => (
              <tr key={s.id}>
                <td><b>{s.name}</b></td>
                <td>{s.county || '—'}</td>
                <td><span className="badge info">{s.level}</span></td>
                <td>{s.gender}</td>
                <td className="text-mute">{s.primary_color}{s.secondary_color ? ' / ' + s.secondary_color : ''}</td>
                <td><button className="btn sm" onClick={() => edit(s)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showAdd || editing} title={editing ? 'Edit school' : 'Add school'} onClose={() => { setShowAdd(false); setEditing(null); }}
        actions={<><button className="btn" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</button><button className="btn primary" onClick={save}>Save</button></>}>
        <div className="field"><label className="label">Name</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div className="row">
          <div className="field"><label className="label">County</label><input className="input" value={form.county} onChange={e => setForm({ ...form, county: e.target.value })} /></div>
          <div className="field"><label className="label">Code</label><input className="input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
        </div>
        <div className="row">
          <div className="field"><label className="label">Level</label>
            <select className="select" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
              <option value="pre-primary">Pre-primary</option><option value="primary">Primary</option><option value="jss">JSS</option><option value="secondary">Secondary</option><option value="tertiary">Tertiary</option>
            </select>
          </div>
          <div className="field"><label className="label">Gender</label>
            <select className="select" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
              <option value="mixed">Mixed</option><option value="boys">Boys</option><option value="girls">Girls</option>
            </select>
          </div>
        </div>
        <div className="row">
          <div className="field"><label className="label">Primary colour</label><input className="input" value={form.primary_color} onChange={e => setForm({ ...form, primary_color: e.target.value })} /></div>
          <div className="field"><label className="label">Secondary colour</label><input className="input" value={form.secondary_color} onChange={e => setForm({ ...form, secondary_color: e.target.value })} /></div>
        </div>
        <div className="field"><label className="label">Notes</label><textarea className="textarea" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
      </Modal>
    </>
  );
}

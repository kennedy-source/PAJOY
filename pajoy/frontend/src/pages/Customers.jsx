import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { downloadCsv } from '../services/export.js';
import Modal from '../components/Modal.jsx';

export default function Customers() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [editing, setEditing] = useState(null);

  function load() { api.get('/api/customers' + (q ? `?q=${encodeURIComponent(q)}` : '')).then(setItems); }
  useEffect(() => { load(); }, [q]);

  async function save() {
    if (!form.name) return;
    if (editing) {
      await api.put('/api/customers/' + editing.id, form);
      setEditing(null);
    } else {
      await api.post('/api/customers', form);
      setShowAdd(false);
    }
    setForm({ name: '', phone: '', email: '', notes: '' });
    load();
  }

  function edit(item) {
    setEditing(item);
    setForm({
      name: item.name,
      phone: item.phone || '',
      email: item.email || '',
      notes: item.notes || ''
    });
  }
  return (
    <>
      <div className="flex between center mb-16">
        <div><h1>Customers</h1><div className="page-sub">{items.length} customers</div></div>
        <div className="flex gap-8">
          <input className="input" placeholder="Search customers…" value={q} onChange={e => setQ(e.target.value)} style={{ width: 240 }} />
          <button className="btn" onClick={() => downloadCsv('customers.csv', items, [
            { key: 'name', label: 'Name' },
            { key: 'phone', label: 'Phone' },
            { key: 'email', label: 'Email' },
            { key: 'notes', label: 'Notes' }
          ])}>Export CSV</button>
          <button className="btn primary" onClick={() => setShowAdd(true)}>+ New customer</button>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Notes</th><th></th></tr></thead>
          <tbody>{items.map(c => (
            <tr key={c.id}><td><b>{c.name}</b></td><td>{c.phone || '—'}</td><td>{c.email || '—'}</td><td className="text-mute">{c.notes || ''}</td><td><button className="btn sm" onClick={() => edit(c)}>Edit</button></td></tr>
          ))}</tbody>
        </table>
      </div>
      <Modal open={showAdd || editing} title={editing ? 'Edit customer' : 'New customer'} onClose={() => { setShowAdd(false); setEditing(null); }}
        actions={<><button className="btn" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</button><button className="btn primary" onClick={save}>Save</button></>}>
        <div className="field"><label className="label">Name</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div className="row">
          <div className="field"><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="field"><label className="label">Email</label><input className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
        </div>
        <div className="field"><label className="label">Notes</label><textarea className="textarea" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
      </Modal>
    </>
  );
}

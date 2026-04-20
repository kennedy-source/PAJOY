import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { downloadCsv } from '../services/export.js';
import Modal from '../components/Modal.jsx';

export default function Suppliers() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', contact: '', phone: '', email: '', category: '', notes: '' });
  const [editing, setEditing] = useState(null);
  function load() { api.get('/api/suppliers').then(setItems); }
  const filteredItems = items.filter(s => {
    const term = q.trim().toLowerCase();
    if (!term) return true;
    return s.name.toLowerCase().includes(term)
      || (s.contact || '').toLowerCase().includes(term)
      || (s.phone || '').toLowerCase().includes(term)
      || (s.category || '').toLowerCase().includes(term);
  });
  useEffect(load, []);
  async function save() {
    if (!form.name) return;
    if (editing) {
      await api.put('/api/suppliers/' + editing.id, form);
      setEditing(null);
    } else {
      await api.post('/api/suppliers', form);
      setShowAdd(false);
    }
    setForm({ name: '', contact: '', phone: '', email: '', category: '', notes: '' });
    load();
  }

  function edit(item) {
    setEditing(item);
    setForm({
      name: item.name,
      contact: item.contact || '',
      phone: item.phone || '',
      email: item.email || '',
      category: item.category || '',
      notes: item.notes || ''
    });
  }
  return (
    <>
      <div className="flex between center mb-16">
        <div><h1>Suppliers</h1><div className="page-sub">{filteredItems.length} of {items.length} suppliers</div></div>
        <div className="flex gap-8">
          <input className="input" placeholder="Search suppliers…" value={q} onChange={e => setQ(e.target.value)} style={{ width: 240 }} />
          <button className="btn" onClick={() => downloadCsv('suppliers.csv', filteredItems, [
            { key: 'name', label: 'Name' },
            { key: 'contact', label: 'Contact' },
            { key: 'phone', label: 'Phone' },
            { key: 'email', label: 'Email' },
            { key: 'category', label: 'Category' }
          ])}>Export CSV</button>
          <button className="btn primary" onClick={() => setShowAdd(true)}>+ New supplier</button>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>Name</th><th>Contact</th><th>Phone</th><th>Category</th><th></th></tr></thead>
          <tbody>{filteredItems.map(s => <tr key={s.id}><td><b>{s.name}</b></td><td>{s.contact || '—'}</td><td>{s.phone || '—'}</td><td><span className="badge">{s.category || '—'}</span></td><td><button className="btn sm" onClick={() => edit(s)}>Edit</button></td></tr>)}</tbody>
        </table>
      </div>
      <Modal open={showAdd || editing} title={editing ? 'Edit supplier' : 'New supplier'} onClose={() => { setShowAdd(false); setEditing(null); }}
        actions={<><button className="btn" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</button><button className="btn primary" onClick={save}>Save</button></>}>
        <div className="field"><label className="label">Name</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div className="row">
          <div className="field"><label className="label">Contact person</label><input className="input" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} /></div>
          <div className="field"><label className="label">Category</label><input className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
        </div>
        <div className="row">
          <div className="field"><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="field"><label className="label">Email</label><input className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
        </div>
      </Modal>
    </>
  );
}

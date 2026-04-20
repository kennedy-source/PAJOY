import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { downloadCsv } from '../services/export.js';
import Modal from '../components/Modal.jsx';

const fmt = (n) => 'KES ' + Number(n || 0).toLocaleString();

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [schools, setSchools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', category_id: '', school_id: '', base_price: 0, cost_price: 0, reorder_level: 5 });
  const [editing, setEditing] = useState(null);

  function load() {
    const qs = new URLSearchParams(); if (q) qs.set('q', q);
    api.get('/api/products?' + qs.toString()).then(setItems);
  }
  useEffect(() => { load(); }, [q]);
  useEffect(() => {
    api.get('/api/schools').then(setSchools);
    api.get('/api/categories').then(setCategories);
  }, []);

  async function save() {
    if (!form.name) return;
    if (editing) {
      await api.put('/api/products/' + editing.id, form);
      setEditing(null);
    } else {
      await api.post('/api/products', form);
      setShowAdd(false);
    }
    setForm({ name: '', sku: '', category_id: '', school_id: '', base_price: 0, cost_price: 0, reorder_level: 5 });
    load();
  }

  function edit(item) {
    setEditing(item);
    setForm({
      name: item.name,
      sku: item.sku || '',
      category_id: item.category_id || '',
      school_id: item.school_id || '',
      base_price: item.base_price || 0,
      cost_price: item.cost_price || 0,
      reorder_level: item.reorder_level || 5
    });
  }

  return (
    <>
      <div className="flex between center mb-16">
        <div>
          <h1>Inventory</h1>
          <div className="page-sub">{items.length} active products</div>
        </div>
        <div className="flex gap-8">
          <input className="input" placeholder="Search inventory…" value={q} onChange={e => setQ(e.target.value)} style={{ width: 260 }} />
          <button className="btn" onClick={() => downloadCsv('inventory.csv', items, [
            { key: 'sku', label: 'SKU' },
            { key: 'name', label: 'Product' },
            { key: 'school_name', label: 'School' },
            { key: 'category_name', label: 'Category' },
            { key: 'base_price', label: 'Price' },
            { key: 'total_stock', label: 'Stock' }
          ])}>Export CSV</button>
          <button className="btn primary" onClick={() => setShowAdd(true)}>+ New product</button>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>SKU</th><th>Name</th><th>School</th><th>Category</th><th className="text-right">Price</th><th className="text-right">Stock</th><th></th></tr></thead>
          <tbody>
            {items.map(p => (
              <tr key={p.id}>
                <td className="text-mute">{p.sku}</td>
                <td><b>{p.name}</b></td>
                <td>{p.school_name || '—'}</td>
                <td>{p.category_name || '—'}</td>
                <td className="text-right">{fmt(p.base_price)}</td>
                <td className="text-right">
                  <span className={'badge ' + (p.total_stock <= p.reorder_level ? 'danger' : 'success')}>{p.total_stock}</span>
                </td>
                <td>
                  <div className="flex gap-4">
                    <button className="btn sm" onClick={() => edit(p)}>Edit</button>
                    <Link to={'/inventory/' + p.id} className="btn sm">Manage</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showAdd || editing} title={editing ? 'Edit product' : 'Add product'} onClose={() => { setShowAdd(false); setEditing(null); }}
        actions={<>
          <button className="btn" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</button>
          <button className="btn primary" onClick={save}>Save</button>
        </>}>
        <div className="field"><label className="label">Name</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div className="row">
          <div className="field"><label className="label">SKU (auto if blank)</label><input className="input" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} /></div>
          <div className="field"><label className="label">Reorder level</label><input className="input" type="number" value={form.reorder_level} onChange={e => setForm({ ...form, reorder_level: +e.target.value })} /></div>
        </div>
        <div className="row">
          <div className="field"><label className="label">School</label>
            <select className="select" value={form.school_id} onChange={e => setForm({ ...form, school_id: e.target.value })}>
              <option value="">—</option>{schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="field"><label className="label">Category</label>
            <select className="select" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
              <option value="">—</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="row">
          <div className="field"><label className="label">Selling price</label><input className="input" type="number" value={form.base_price} onChange={e => setForm({ ...form, base_price: +e.target.value })} /></div>
          <div className="field"><label className="label">Cost price</label><input className="input" type="number" value={form.cost_price} onChange={e => setForm({ ...form, cost_price: +e.target.value })} /></div>
        </div>
      </Modal>
    </>
  );
}

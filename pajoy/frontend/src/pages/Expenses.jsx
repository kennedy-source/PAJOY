import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import Modal from '../components/Modal.jsx';

const CATS = ['rent','salaries','transport','electricity','water','supplies','thread','printing materials','maintenance','other'];
const fmt = (n) => 'KES ' + Number(n || 0).toLocaleString();

export default function Expenses({ user }) {
  const [items, setItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: 'other', amount: 0, description: '' });
  function load() { api.get('/api/expenses').then(setItems); }
  useEffect(load, []);
  async function approve(id, status) {
    try {
      await api.put('/api/expenses/' + id + '/approve', { status, actor: user.id });
      load();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }
  async function save() {
    try {
      await api.post('/api/expenses', { ...form, actor: user.id });
      setForm({ category: 'other', amount: 0, description: '' });
      setShowAdd(false);
      load();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }
  const total = items.reduce((s, e) => s + e.amount, 0);
  return (
    <>
      <div className="flex between center mb-16">
        <div><h1>Expenses</h1><div className="page-sub">Total recorded: <b>{fmt(total)}</b></div></div>
        <button className="btn primary" onClick={() => setShowAdd(true)}>+ Record expense</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>Date</th><th>Category</th><th>Description</th><th className="text-right">Amount</th><th>Status</th><th></th></tr></thead>
          <tbody>{items.map(e => (
            <tr key={e.id}>
              <td>{new Date(e.date).toLocaleDateString()}</td>
              <td><span className="badge">{e.category}</span></td>
              <td>{e.description || '—'}</td>
              <td className="text-right"><b>{fmt(e.amount)}</b></td>
              <td><span className={`badge ${e.status === 'approved' ? 'success' : e.status === 'rejected' ? 'danger' : 'warning'}`}>{e.status || 'pending'}</span></td>
              <td>
                {(user.role === 'admin' || user.role === 'manager') && e.status === 'pending' && (
                  <div className="flex gap-4">
                    <button className="btn sm success" onClick={() => approve(e.id, 'approved')}>Approve</button>
                    <button className="btn sm danger" onClick={() => approve(e.id, 'rejected')}>Reject</button>
                  </div>
                )}
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <Modal open={showAdd} title="Record expense" onClose={() => setShowAdd(false)}
        actions={<><button className="btn" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn primary" onClick={save}>Save</button></>}>
        <div className="row">
          <div className="field"><label className="label">Category</label>
            <select className="select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{CATS.map(c => <option key={c}>{c}</option>)}</select>
          </div>
          <div className="field"><label className="label">Amount (KES)</label><input className="input" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: +e.target.value })} /></div>
        </div>
        <div className="field"><label className="label">Description</label><textarea className="textarea" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
      </Modal>
    </>
  );
}

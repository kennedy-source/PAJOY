import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { downloadCsv } from '../services/export.js';
import Modal from '../components/Modal.jsx';

export default function Jobs({ user }) {
  const [jobs, setJobs] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({ product_id: '', variant_id: '', quantity: 1, assigned_to: '', notes: '' });
  const [editing, setEditing] = useState(null);

  function load() { 
    api.get('/api/jobs').then(setJobs); 
    api.get('/api/products').then(setProducts);
    api.get('/api/users').then(setUsers);
  }
  useEffect(load, []);

  async function save() {
    try {
      if (!form.product_id || !form.quantity) return alert('Product and quantity required');
      if (editing) {
        await api.put('/api/jobs/' + editing.id, { ...form, actor: user.id });
        setEditing(null);
      } else {
        await api.post('/api/jobs', { ...form, actor: user.id });
        setShowAdd(false);
      }
      setForm({ product_id: '', variant_id: '', quantity: 1, assigned_to: '', notes: '' });
      load();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }

  function edit(job) {
    setEditing(job);
    setForm({
      product_id: job.product_id,
      variant_id: job.variant_id || '',
      quantity: job.quantity,
      assigned_to: job.assigned_to || '',
      notes: job.notes || ''
    });
    setShowAdd(true);
  }

  async function updateStatus(id, status) {
    try {
      await api.put('/api/jobs/' + id + '/status', { status, actor: user.id });
      load();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }

  const canManage = user.role === 'admin' || user.role === 'manager' || user.role === 'production';
  const filteredJobs = jobs.filter(j => {
    const keyword = q.trim().toLowerCase();
    const matchesStatus = !statusFilter || j.status === statusFilter;
    const matchesSearch = !keyword || [j.product_name, j.assigned_username, j.status].some(value => (value || '').toLowerCase().includes(keyword));
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <h1>Production Jobs</h1>
      <div className="page-sub">Track manufacturing and production tasks</div>

      <div className="flex between mb-16">
        <div className="flex gap-8">
          <input className="input" placeholder="Search jobs…" value={q} onChange={e => setQ(e.target.value)} style={{ width: 220 }} />
          <select className="select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="btn" onClick={() => downloadCsv('jobs.csv', filteredJobs, [
            { key: 'product_name', label: 'Product' },
            { key: 'quantity', label: 'Qty' },
            { key: 'status', label: 'Status' },
            { key: 'assigned_username', label: 'Assigned To' },
            { key: 'created_at', label: 'Created', value: row => new Date(row.created_at).toLocaleDateString() }
          ])}>Export CSV</button>
        </div>
        {canManage && <button className="btn primary" onClick={() => setShowAdd(true)}>+ Create Job</button>}
      </div>

      <div className="card">
        <table className="table">
          <thead><tr><th>Product</th><th>Quantity</th><th>Status</th><th>Assigned To</th><th>Created</th><th></th></tr></thead>
          <tbody>
            {filteredJobs.map(j => (
              <tr key={j.id}>
                <td>{j.product_name}</td>
                <td>{j.quantity}</td>
                <td><span className={`badge ${j.status === 'completed' ? 'success' : j.status === 'in_progress' ? 'primary' : 'warning'}`}>{j.status}</span></td>
                <td>{j.assigned_username || 'Unassigned'}</td>
                <td>{new Date(j.created_at).toLocaleDateString()}</td>
                <td>
                  {canManage && (
                    <div className="flex gap-4">
                      <button className="btn sm" onClick={() => edit(j)}>Edit</button>
                      {j.status !== 'completed' && j.status !== 'cancelled' && (
                        <select className="select sm" value={j.status} onChange={e => updateStatus(j.id, e.target.value)}>
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title={editing ? 'Edit Job' : 'Create Job'} onClose={() => { setShowAdd(false); setEditing(null); }}
          actions={<><button className="btn" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</button><button className="btn primary" onClick={save}>{editing ? 'Update' : 'Create'}</button></>}>
          <div className="field"><label className="label">Product</label>
            <select className="select" value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })}>
              <option value="">Select product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="row">
            <div className="field"><label className="label">Quantity</label><input className="input" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: +e.target.value })} /></div>
            <div className="field"><label className="label">Assigned To</label>
              <select className="select" value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })}>
                <option value="">Unassigned</option>
                {users.filter(u => u.role === 'production').map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
              </select>
            </div>
          </div>
          <div className="field"><label className="label">Notes</label><textarea className="textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
        </Modal>
      )}
    </>
  );
}
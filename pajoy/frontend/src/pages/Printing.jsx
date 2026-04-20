import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import Modal from '../components/Modal.jsx';

const COLS = [
  { key: 'pending', label: 'Pending' },
  { key: 'design_pending', label: 'Design' },
  { key: 'ready', label: 'Ready' },
  { key: 'production', label: 'In production' },
  { key: 'qa', label: 'QA' },
  { key: 'for_collection', label: 'For collection' },
  { key: 'completed', label: 'Completed' }
];

export default function Printing() {
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ customer_id: '', print_type: 'screen', garment: '', design_notes: '', qty: 1, unit_cost: 0 });
  function load() { api.get('/api/printing').then(setJobs); }
  useEffect(() => { load(); api.get('/api/customers').then(setCustomers); }, []);
  async function save() { await api.post('/api/printing', form); setShowAdd(false); load(); }
  async function move(id, status) { await api.put(`/api/printing/${id}/status`, { status }); load(); }

  return (
    <>
      <div className="flex between center mb-16">
        <div><h1>Printing</h1><div className="page-sub">{jobs.length} print jobs</div></div>
        <button className="btn primary" onClick={() => setShowAdd(true)}>+ New print job</button>
      </div>
      <div className="kanban">
        {COLS.map(col => {
          const colJobs = jobs.filter(j => j.status === col.key);
          return (
            <div key={col.key} className="kanban-col">
              <h3>{col.label}<span className="badge">{colJobs.length}</span></h3>
              {colJobs.map(j => (
                <div key={j.id} className="kanban-card">
                  <div className="kc-title">{j.job_no}</div>
                  <div>{j.customer_name || '—'}</div>
                  <div className="text-mute">{j.print_type} · {j.garment} × {j.qty}</div>
                  <div className="text-mute">KES {j.total_cost}</div>
                  <select className="select mt-12" style={{ padding: 4, fontSize: 11 }} value={j.status} onChange={e => move(j.id, e.target.value)}>
                    {COLS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <Modal open={showAdd} title="New print job" size="lg" onClose={() => setShowAdd(false)}
        actions={<><button className="btn" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn primary" onClick={save}>Create</button></>}>
        <div className="row">
          <div className="field"><label className="label">Customer</label>
            <select className="select" value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}>
              <option value="">—</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field"><label className="label">Type</label>
            <select className="select" value={form.print_type} onChange={e => setForm({ ...form, print_type: e.target.value })}>
              <option value="screen">Screen printing</option>
              <option value="heat_press">Heat press</option>
              <option value="vinyl">Vinyl</option>
              <option value="sublimation">Sublimation</option>
              <option value="text">Text printing</option>
            </select>
          </div>
        </div>
        <div className="field"><label className="label">Garment / item</label><input className="input" value={form.garment} onChange={e => setForm({ ...form, garment: e.target.value })} /></div>
        <div className="field"><label className="label">Design notes</label><textarea className="textarea" rows={2} value={form.design_notes} onChange={e => setForm({ ...form, design_notes: e.target.value })} /></div>
        <div className="row-3">
          <div className="field"><label className="label">Qty</label><input className="input" type="number" value={form.qty} onChange={e => setForm({ ...form, qty: +e.target.value })} /></div>
          <div className="field"><label className="label">Unit cost</label><input className="input" type="number" value={form.unit_cost} onChange={e => setForm({ ...form, unit_cost: +e.target.value })} /></div>
          <div className="field"><label className="label">Total</label><input className="input" disabled value={(form.qty || 0) * (form.unit_cost || 0)} /></div>
        </div>
      </Modal>
    </>
  );
}

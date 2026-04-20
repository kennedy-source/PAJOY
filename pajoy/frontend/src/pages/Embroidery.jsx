import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import Modal from '../components/Modal.jsx';

const COLS = [
  { key: 'pending', label: 'Pending' },
  { key: 'artwork', label: 'Artwork' },
  { key: 'digitizing', label: 'Digitizing' },
  { key: 'ready', label: 'Ready' },
  { key: 'production', label: 'In production' },
  { key: 'qa', label: 'QA' },
  { key: 'for_collection', label: 'For collection' },
  { key: 'completed', label: 'Completed' }
];

export default function Embroidery() {
  const [jobs, setJobs] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [form, setForm] = useState({ customer_id: '', school_id: '', garment: '', design_notes: '', thread_colours: '', placement: '', qty: 1, unit_cost: 0 });

  function load() { api.get('/api/embroidery').then(setJobs); }
  useEffect(() => { load(); api.get('/api/customers').then(setCustomers); api.get('/api/schools').then(setSchools); }, []);
  async function save() { await api.post('/api/embroidery', form); setShowAdd(false); load(); }
  async function move(id, status) { await api.put(`/api/embroidery/${id}/status`, { status }); load(); }

  return (
    <>
      <div className="flex between center mb-16">
        <div><h1>Embroidery</h1><div className="page-sub">{jobs.length} jobs · drag-free Kanban (use buttons)</div></div>
        <button className="btn primary" onClick={() => setShowAdd(true)}>+ New embroidery job</button>
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
                  <div>{j.school_name || j.customer_name || '—'}</div>
                  <div className="text-mute">{j.garment} × {j.qty}</div>
                  <div className="text-mute">KES {j.total_cost}</div>
                  {j.due_date && <div className="text-mute">Due {new Date(j.due_date).toLocaleDateString()}</div>}
                  <div className="flex gap-8 mt-12">
                    <select className="select" style={{ padding: 4, fontSize: 11 }} value={j.status} onChange={e => move(j.id, e.target.value)}>
                      {COLS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <Modal open={showAdd} title="New embroidery job" size="lg" onClose={() => setShowAdd(false)}
        actions={<><button className="btn" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn primary" onClick={save}>Create</button></>}>
        <div className="row">
          <div className="field"><label className="label">Customer</label>
            <select className="select" value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}>
              <option value="">—</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field"><label className="label">School</label>
            <select className="select" value={form.school_id} onChange={e => setForm({ ...form, school_id: e.target.value })}>
              <option value="">—</option>{schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div className="row">
          <div className="field"><label className="label">Garment</label><input className="input" value={form.garment} onChange={e => setForm({ ...form, garment: e.target.value })} /></div>
          <div className="field"><label className="label">Placement</label><input className="input" value={form.placement} onChange={e => setForm({ ...form, placement: e.target.value })} /></div>
        </div>
        <div className="field"><label className="label">Thread colours</label><input className="input" value={form.thread_colours} onChange={e => setForm({ ...form, thread_colours: e.target.value })} /></div>
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

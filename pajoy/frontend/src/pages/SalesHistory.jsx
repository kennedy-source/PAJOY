import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { downloadCsv } from '../services/export.js';
import Modal from '../components/Modal.jsx';

const fmt = (n) => 'KES ' + Number(n || 0).toLocaleString();

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(null);
  function load() { api.get('/api/sales?limit=200').then(setSales); }
  useEffect(load, []);
  const filteredSales = sales.filter(s => {
    const term = q.trim().toLowerCase();
    if (!term) return true;
    return s.receipt_no.toLowerCase().includes(term)
      || (s.customer_name || '').toLowerCase().includes(term)
      || (s.cashier_name || '').toLowerCase().includes(term)
      || s.payment_method.toLowerCase().includes(term)
      || s.status.toLowerCase().includes(term);
  });
  async function open(id) { setActive(await api.get('/api/sales/' + id)); }
  async function refund() { await api.post(`/api/sales/${active.id}/refund`, {}); setActive(null); load(); }
  return (
    <>
      <h1>Sales</h1>
      <div className="page-sub">Last 200 transactions</div>
      <div className="flex between mb-16">
        <input className="input" placeholder="Search sales…" value={q} onChange={e => setQ(e.target.value)} style={{ width: 280 }} />
        <button className="btn" onClick={() => downloadCsv('sales.csv', filteredSales, [
          { key: 'receipt_no', label: 'Receipt' },
          { key: 'customer_name', label: 'Customer' },
          { key: 'cashier_name', label: 'Cashier' },
          { key: 'payment_method', label: 'Method' },
          { key: 'status', label: 'Status' },
          { key: 'total', label: 'Total' },
          { key: 'created_at', label: 'Date', value: row => new Date(row.created_at).toLocaleString() }
        ])}>Export CSV</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>Receipt</th><th>Customer</th><th>Cashier</th><th>Method</th><th>Status</th><th className="text-right">Total</th><th>Date</th><th></th></tr></thead>
          <tbody>{filteredSales.map(s => (
            <tr key={s.id}>
              <td><b>{s.receipt_no}</b></td>
              <td>{s.customer_name || '—'}</td>
              <td>{s.cashier_name || '—'}</td>
              <td><span className={'badge ' + (s.payment_method === 'mpesa' ? 'success' : 'info')}>{s.payment_method}</span></td>
              <td><span className={'badge ' + (s.status === 'refunded' ? 'danger' : 'success')}>{s.status}</span></td>
              <td className="text-right"><b>{fmt(s.total)}</b></td>
              <td className="text-mute">{new Date(s.created_at).toLocaleString()}</td>
              <td><button className="btn sm" onClick={() => open(s.id)}>View</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <Modal open={!!active} title={active?.receipt_no} size="lg" onClose={() => setActive(null)}
        actions={active && active.status !== 'refunded' ? <button className="btn danger" onClick={refund}>Refund</button> : null}>
        {active && (
          <>
            <div className="text-mute mb-12">{new Date(active.created_at).toLocaleString()} · {active.cashier_name}</div>
            <table className="table">
              <thead><tr><th>Item</th><th>Qty</th><th className="text-right">Price</th><th className="text-right">Total</th></tr></thead>
              <tbody>{active.items.map(i => (
                <tr key={i.id}><td>{i.name_snapshot}</td><td>{i.qty}</td><td className="text-right">{fmt(i.unit_price)}</td><td className="text-right">{fmt(i.line_total)}</td></tr>
              ))}</tbody>
            </table>
            <div className="flex between mt-12"><span>Subtotal</span><b>{fmt(active.subtotal)}</b></div>
            <div className="flex between"><span>Discount</span><b>-{fmt(active.discount)}</b></div>
            <div className="flex between mt-12" style={{ fontSize: 18 }}><span>Total</span><b style={{ color: 'var(--accent)' }}>{fmt(active.total)}</b></div>
          </>
        )}
      </Modal>
    </>
  );
}

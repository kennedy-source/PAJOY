import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

const fmt = (n) => 'KES ' + Number(n || 0).toLocaleString();
const COLORS = ['#4f7cff','#8b5cf6','#34d399','#fbbf24','#f87171','#60a5fa','#ffb648','#22d3ee'];

export default function Reports() {
  const [top, setTop] = useState([]);
  const [byCat, setByCat] = useState([]);
  const [profit, setProfit] = useState(null);
  const [low, setLow] = useState([]);
  useEffect(() => {
    api.get('/api/reports/top-items').then(setTop);
    api.get('/api/reports/sales-by-category').then(setByCat);
    api.get('/api/reports/profit-estimate?days=30').then(setProfit);
    api.get('/api/products/meta/low-stock').then(setLow);
  }, []);

  return (
    <>
      <h1>Reports</h1>
      <div className="page-sub">Last 30 days</div>

      {profit && (
        <div className="stat-grid">
          <div className="stat-card"><div className="label">Revenue</div><div className="value">{fmt(profit.revenue)}</div></div>
          <div className="stat-card"><div className="label">COGS</div><div className="value">{fmt(profit.cogs)}</div></div>
          <div className="stat-card"><div className="label">Expenses</div><div className="value">{fmt(profit.expenses)}</div></div>
          <div className="stat-card accent"><div className="label">Net profit (est.)</div><div className="value" style={{ color: profit.net_profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>{fmt(profit.net_profit)}</div></div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="card">
          <h3>Top items by revenue</h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={top}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243049" />
                <XAxis dataKey="name" stroke="#6b7390" fontSize={10} angle={-25} textAnchor="end" height={80} interval={0} />
                <YAxis stroke="#6b7390" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1a2236', border: '1px solid #243049' }} />
                <Bar dataKey="revenue" fill="#4f7cff" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h3>Sales by category</h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byCat} dataKey="revenue" nameKey="category" outerRadius={90}>
                  {byCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a2236', border: '1px solid #243049' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card mt-16">
        <h3>Low-stock report</h3>
        {!low.length ? <div className="text-mute">All products above reorder level. ✓</div> :
          <table className="table">
            <thead><tr><th>SKU</th><th>Product</th><th className="text-right">Reorder level</th><th className="text-right">Total stock</th></tr></thead>
            <tbody>{low.map(p => (
              <tr key={p.id}><td>{p.sku}</td><td>{p.name}</td><td className="text-right">{p.reorder_level}</td>
                <td className="text-right"><span className="badge danger">{p.total_stock}</span></td></tr>
            ))}</tbody>
          </table>}
      </div>
    </>
  );
}

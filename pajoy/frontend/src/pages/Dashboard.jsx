import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const fmt = (n) => 'KES ' + Number(n || 0).toLocaleString();

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [s, setS] = useState(null);
  const [trend, setTrend] = useState([]);
  
  useEffect(() => {
    // Get current user
    const userData = localStorage.getItem('pajoy_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    if (user) {
      // Load data based on user role
      api.get('/api/reports/summary').then(setS).catch(console.error);
      api.get('/api/reports/sales-trend?days=14').then(setTrend).catch(console.error);
    }
  }, [user]);
  if (!s) return <div className="text-mute">Loading…</div>;
  
  // Role-based dashboard content
  const renderAdminDashboard = () => (
    <>
      <h1>Admin Dashboard</h1>
      <div className="page-sub">System overview and management</div>
      <div className="stat-grid">
        <div className="stat-card accent"><div className="label">Today's sales</div><div className="value">{fmt(s.today_sales)}</div><div className="delta">{s.today_count} transactions</div></div>
        <div className="stat-card"><div className="label">7-day revenue</div><div className="value">{fmt(s.week_sales)}</div></div>
        <div className="stat-card"><div className="label">30-day revenue</div><div className="value">{fmt(s.month_sales)}</div></div>
        <div className="stat-card"><div className="label">Low-stock items</div><div className="value">{s.low_stock_count}</div><div className="delta" style={{ color: s.low_stock_count > 0 ? 'var(--warn)' : 'var(--success)' }}>{s.low_stock_count > 0 ? 'Needs attention' : 'All good'}</div></div>
        <div className="stat-card"><div className="label">Active users</div><div className="value">{s.active_users || 0}</div></div>
        <div className="stat-card"><div className="label">Pending jobs</div><div className="value">{(s.pending_embroidery || 0) + (s.pending_printing || 0)}</div></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="card">
          <h3>Sales — last 14 days</h3>
          <div style={{ height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243049" />
                <XAxis dataKey="date" stroke="#6b7390" fontSize={11} />
                <YAxis stroke="#6b7390" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1a2236', border: '1px solid #243049', borderRadius: 8 }} />
                <Line type="monotone" dataKey="total" stroke="#4f7cff" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h3>Production queue</h3>
          <div className="flex between center" style={{ padding: '10px 0', borderBottom: '1px solid var(--border-soft)' }}>
            <div>Embroidery jobs</div>
            <span className="badge warn">{s.pending_embroidery} pending</span>
          </div>
          <div className="flex between center" style={{ padding: '10px 0' }}>
            <div>Print jobs</div>
            <span className="badge warn">{s.pending_printing} pending</span>
          </div>
        </div>
      </div>
      <div className="card mt-16">
        <h3>Recent transactions</h3>
        {s.recent.length === 0 ? <div className="text-mute">No sales yet today.</div> :
          <table className="table">
            <thead><tr><th>Receipt</th><th>Customer</th><th>Method</th><th className="text-right">Total</th><th>Time</th></tr></thead>
            <tbody>
              {s.recent.map(r => (
                <tr key={r.id}>
                  <td><b>{r.receipt_no}</b></td>
                  <td>{r.customer_name || '—'}</td>
                  <td><span className={'badge ' + (r.payment_method === 'mpesa' ? 'success' : 'info')}>{r.payment_method}</span></td>
                  <td className="text-right"><b>{fmt(r.total)}</b></td>
                  <td className="text-mute">{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>}
      </div>
    </>
  );

  const renderManagerDashboard = () => (
    <>
      <h1>Manager Dashboard</h1>
      <div className="page-sub">Sales and team performance</div>
      <div className="stat-grid">
        <div className="stat-card accent"><div className="label">Today's sales</div><div className="value">{fmt(s.today_sales)}</div><div className="delta">{s.today_count} transactions</div></div>
        <div className="stat-card"><div className="label">7-day revenue</div><div className="value">{fmt(s.week_sales)}</div></div>
        <div className="stat-card"><div className="label">30-day revenue</div><div className="value">{fmt(s.month_sales)}</div></div>
        <div className="stat-card"><div className="label">Low-stock items</div><div className="value">{s.low_stock_count}</div><div className="delta" style={{ color: s.low_stock_count > 0 ? 'var(--warn)' : 'var(--success)' }}>{s.low_stock_count > 0 ? 'Needs attention' : 'All good'}</div></div>
        <div className="stat-card"><div className="label">Team performance</div><div className="value">{s.team_performance || 'Good'}</div></div>
      </div>
      <div className="card mt-16">
        <h3>Quick Actions</h3>
        <div className="flex gap-8">
          <button className="btn primary" onClick={() => window.location.href = '/pos'}>+ New Sale</button>
          <button className="btn" onClick={() => window.location.href = '/users'}>Manage Team</button>
          <button className="btn" onClick={() => window.location.href = '/reports'}>View Reports</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="card">
          <h3>Sales — last 14 days</h3>
          <div style={{ height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243049" />
                <XAxis dataKey="date" stroke="#6b7390" fontSize={11} />
                <YAxis stroke="#6b7390" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1a2236', border: '1px solid #243049', borderRadius: 8 }} />
                <Line type="monotone" dataKey="total" stroke="#4f7cff" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h3>Production queue</h3>
          <div className="flex between center" style={{ padding: '10px 0', borderBottom: '1px solid var(--border-soft)' }}>
            <div>Embroidery jobs</div>
            <span className="badge warn">{s.pending_embroidery} pending</span>
          </div>
          <div className="flex between center" style={{ padding: '10px 0' }}>
            <div>Print jobs</div>
            <span className="badge warn">{s.pending_printing} pending</span>
          </div>
        </div>
      </div>
      <div className="card mt-16">
        <h3>Recent transactions</h3>
        {s.recent.length === 0 ? <div className="text-mute">No sales yet today.</div> :
          <table className="table">
            <thead><tr><th>Receipt</th><th>Customer</th><th>Method</th><th className="text-right">Total</th><th>Time</th></tr></thead>
            <tbody>
              {s.recent.map(r => (
                <tr key={r.id}>
                  <td><b>{r.receipt_no}</b></td>
                  <td>{r.customer_name || '—'}</td>
                  <td><span className={'badge ' + (r.payment_method === 'mpesa' ? 'success' : 'info')}>{r.payment_method}</span></td>
                  <td className="text-right"><b>{fmt(r.total)}</b></td>
                  <td className="text-mute">{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>}
      </div>
    </>
  );

  const renderCashierDashboard = () => (
    <>
      <h1>Cashier Dashboard</h1>
      <div className="page-sub">Point of Sale operations</div>
      <div className="stat-grid">
        <div className="stat-card accent"><div className="label">Today's sales</div><div className="value">{fmt(s.today_sales)}</div><div className="delta">{s.today_count} transactions</div></div>
        <div className="stat-card"><div className="label">7-day revenue</div><div className="value">{fmt(s.week_sales)}</div></div>
        <div className="stat-card"><div className="label">30-day revenue</div><div className="value">{fmt(s.month_sales)}</div></div>
        <div className="stat-card"><div className="label">Average transaction</div><div className="value">{fmt(s.avg_transaction)}</div></div>
      </div>
      <div className="card mt-16">
        <h3>Recent transactions</h3>
        {s.recent.length === 0 ? <div className="text-mute">No sales yet today.</div> :
          <table className="table">
            <thead><tr><th>Receipt</th><th>Customer</th><th>Method</th><th className="text-right">Total</th><th>Time</th></tr></thead>
            <tbody>
              {s.recent.map(r => (
                <tr key={r.id}>
                  <td><b>{r.receipt_no}</b></td>
                  <td>{r.customer_name || '—'}</td>
                  <td><span className={'badge ' + (r.payment_method === 'mpesa' ? 'success' : 'info')}>{r.payment_method}</span></td>
                  <td className="text-right"><b>{fmt(r.total)}</b></td>
                  <td className="text-mute">{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>}
      </div>
    </>
  );

  const renderProductionDashboard = () => (
    <>
      <h1>Production Dashboard</h1>
      <div className="page-sub">Manufacturing and job tracking</div>
      <div className="stat-grid">
        <div className="stat-card accent"><div className="label">Pending jobs</div><div className="value">{(s.pending_embroidery || 0) + (s.pending_printing || 0)}</div></div>
        <div className="stat-card"><div className="label">Jobs completed today</div><div className="value">{s.jobs_completed_today || 0}</div></div>
        <div className="stat-card"><div className="label">Production efficiency</div><div className="value">{s.production_efficiency || '85%'}</div></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="card">
          <h3>Production queue</h3>
          <div className="flex between center" style={{ padding: '10px 0', borderBottom: '1px solid var(--border-soft)' }}>
            <div>Embroidery jobs</div>
            <span className="badge warn">{s.pending_embroidery} pending</span>
          </div>
          <div className="flex between center" style={{ padding: '10px 0' }}>
            <div>Print jobs</div>
            <span className="badge warn">{s.pending_printing} pending</span>
          </div>
        </div>
      </div>
    </>
  );

  const renderStoreDashboard = () => (
    <>
      <h1>Store Dashboard</h1>
      <div className="page-sub">Inventory and stock management</div>
      <div className="stat-grid">
        <div className="stat-card accent"><div className="label">Low-stock items</div><div className="value">{s.low_stock_count}</div><div className="delta" style={{ color: s.low_stock_count > 0 ? 'var(--warn)' : 'var(--success)' }}>{s.low_stock_count > 0 ? 'Needs attention' : 'All good'}</div></div>
        <div className="stat-card"><div className="label">Total inventory value</div><div className="value">{fmt(s.total_inventory_value)}</div></div>
        <div className="stat-card"><div className="label">Stock movements today</div><div className="value">{s.stock_movements_today || 0}</div></div>
      </div>
      <div className="card mt-16">
        <h3>Quick actions</h3>
        <div className="flex gap-8">
          <button className="btn primary" onClick={() => window.location.href = '/inventory'}>+ New Product</button>
          <button className="btn" onClick={() => window.location.href = '/inventory'}>+ Stock Adjustment</button>
          <button className="btn" onClick={() => window.location.href = '/reports'}>Generate Report</button>
        </div>
      </div>
    </>
  );

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    if (!user) return <div className="text-mute">Loading…</div>;
    
    switch (user.role) {
      case 'admin':
        return renderAdminDashboard();
      case 'manager':
        return renderManagerDashboard();
      case 'cashier':
        return renderCashierDashboard();
      case 'production':
        return renderProductionDashboard();
      case 'store':
        return renderStoreDashboard();
      default:
        return (
          <>
            <h1>Dashboard</h1>
            <div className="page-sub">Welcome back, {user.username}</div>
            <div className="card">
              <p>Your role: <span className="badge">{user.role}</span></p>
              <p>Dashboard functionality is being prepared for your role.</p>
            </div>
          </>
        );
    }
  };

  return (
    <>
      {renderDashboard()}
    </>
  );
}

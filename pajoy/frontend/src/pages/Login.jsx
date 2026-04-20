import React, { useState } from 'react';
import { api } from '../services/api.js';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const { user, requirePasswordChange } = await api.post('/api/auth/login', { username, password });
      const userWithFlag = { ...user, requirePasswordChange };
      onLogin(userWithFlag);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={submit}>
        <div className="brand" style={{ padding: 0, marginBottom: 18 }}>
          <div className="brand-mark">P</div>
          <div>
            <div className="brand-name" style={{ fontSize: 18 }}>PAJOY SYSTEM</div>
            <div className="brand-sub">Retail & Production</div>
          </div>
        </div>
        <h1 style={{ margin: 0, fontSize: 20 }}>Welcome back</h1>
        <div className="sub">Sign in to continue</div>
        <div className="field">
          <label className="label">Username</label>
          <input className="input" value={username} onChange={e => setUsername(e.target.value)} autoFocus />
        </div>
        <div className="field">
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        {err && <div style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 10 }}>{err}</div>}
        <button className="btn primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <div className="hint" style={{ textAlign: 'left', lineHeight: 1.4, marginTop: 12 }}>
          Default logins:
          <br />admin / admin123 (Admin)
          <br />manager / manager123 (Manager)
          <br />cashier / cashier123 (Cashier)
          <br />embroid / prod123 (Production)
          <br />store / store123 (Store Keeper)
        </div>
      </form>
    </div>
  );
}

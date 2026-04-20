import React, { useState } from 'react';
import { api } from '../services/api.js';

export default function Profile({ user, onLogout }) {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [msg, setMsg] = useState('');

  async function changePassword() {
    if (!form.oldPassword || !form.newPassword) return setMsg('All fields required');
    if (form.newPassword !== form.confirmPassword) return setMsg('Passwords do not match');
    if (form.newPassword.length < 6) return setMsg('Password must be at least 6 characters');
    try {
      await api.post('/api/auth/change-password', { userId: user.id, oldPassword: form.oldPassword, newPassword: form.newPassword });
      setMsg('Password changed successfully');
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => onLogout(), 2000); // logout to force re-login
    } catch (e) {
      setMsg('Error: ' + e.message);
    }
  }

  return (
    <>
      <h1>Profile</h1>
      <div className="page-sub">Change your password</div>
      <div className="card" style={{ maxWidth: 400 }}>
        <div className="field"><label className="label">Current Password</label><input className="input" type="password" value={form.oldPassword} onChange={e => setForm({ ...form, oldPassword: e.target.value })} /></div>
        <div className="field"><label className="label">New Password</label><input className="input" type="password" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} /></div>
        <div className="field"><label className="label">Confirm New Password</label><input className="input" type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} /></div>
        <button className="btn primary" onClick={changePassword}>Change Password</button>
        {msg && <div className="mt-12" style={{ color: msg.includes('Error') ? 'var(--danger)' : 'var(--success)' }}>{msg}</div>}
      </div>
    </>
  );
}
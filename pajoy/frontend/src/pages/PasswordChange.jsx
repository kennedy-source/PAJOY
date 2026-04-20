import React, { useState } from 'react';
import { api } from '../services/api.js';

export default function PasswordChange({ user, onPasswordChanged }) {
  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function validatePassword(password) {
    try {
      const result = await api.post('/api/auth/validate-password', { password });
      setValidation(result);
      return result.isValid;
    } catch (e) {
      setValidation({ isValid: false, errors: ['Unable to validate password'] });
      return false;
    }
  }

  async function submit(e) {
    e.preventDefault();
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const isValid = await validatePassword(form.newPassword);
    if (!isValid) return;

    setLoading(true);
    try {
      await api.post('/api/auth/change-password', {
        userId: user.id,
        newPassword: form.newPassword,
        isFirstTime: true
      });
      onPasswordChanged();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function getStrengthColor(strength) {
    switch (strength) {
      case 'weak': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'strong': return '#28a745';
      default: return '#6c757d';
    }
  }

  return (
    <div className="password-change-shell">
      <form className="password-change-card" onSubmit={submit}>
        <div className="brand" style={{ padding: 0, marginBottom: 18 }}>
          <div className="brand-mark">P</div>
          <div>
            <div className="brand-name" style={{ fontSize: 18 }}>PAJOY SYSTEM</div>
            <div className="brand-sub">Retail & Production</div>
          </div>
        </div>

        <h1 style={{ margin: 0, fontSize: 20, marginBottom: 8 }}>Welcome, {user.full_name}!</h1>
        <div className="sub" style={{ marginBottom: 24 }}>
          For security reasons, you must set a new password before continuing.
        </div>

        <div className="field">
          <label className="label">New Password</label>
          <input
            className="input"
            type="password"
            value={form.newPassword}
            onChange={async (e) => {
              setForm({ ...form, newPassword: e.target.value });
              if (e.target.value) await validatePassword(e.target.value);
              else setValidation(null);
            }}
            placeholder="Enter a strong password"
            required
          />
          {validation && (
            <div style={{ marginTop: 8 }}>
              <div style={{
                color: getStrengthColor(validation.strength),
                fontSize: 12,
                fontWeight: 'bold',
                marginBottom: 4
              }}>
                Password Strength: {validation.strength.toUpperCase()}
              </div>
              {validation.errors.length > 0 && (
                <ul style={{ color: '#dc3545', fontSize: 12, margin: 0, paddingLeft: 16 }}>
                  {validation.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="field">
          <label className="label">Confirm New Password</label>
          <input
            className="input"
            type="password"
            value={form.confirmPassword}
            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
            placeholder="Confirm your new password"
            required
          />
        </div>

        {error && <div style={{ color: '#dc3545', fontSize: 12, marginBottom: 10 }}>{error}</div>}

        <div style={{ fontSize: 12, color: '#666', marginBottom: 16, lineHeight: 1.4 }}>
          <strong>Password Requirements:</strong>
          <ul style={{ margin: '4px 0', paddingLeft: 16 }}>
            <li>At least 8 characters long</li>
            <li>One uppercase letter (A-Z)</li>
            <li>One lowercase letter (a-z)</li>
            <li>One number (0-9)</li>
            <li>One special character (!@#$%^&*)</li>
            <li>Not a common password</li>
          </ul>
        </div>

        <button className="btn primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading || !validation?.isValid}>
          {loading ? 'Setting Password…' : 'Set Password & Continue'}
        </button>
      </form>
    </div>
  );
}
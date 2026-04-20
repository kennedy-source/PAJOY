import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import Modal from '../components/Modal.jsx';

export default function SecuritySettings({ user }) {
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [securityStats, setSecurityStats] = useState(null);

  useEffect(() => {
    loadSecurityStats();
  }, []);

  async function loadSecurityStats() {
    try {
      // This would be a new API endpoint to get user security info
      const stats = await api.get(`/api/users/${user.id}/security`);
      setSecurityStats(stats);
    } catch (e) {
      console.error('Failed to load security stats:', e);
    }
  }

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

  async function changePassword() {
    setError(''); setSuccess('');

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
        oldPassword: form.oldPassword,
        newPassword: form.newPassword
      });
      setSuccess('Password changed successfully');
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setValidation(null);
      setShowChangeModal(false);
      loadSecurityStats();
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
    <div className="security-settings">
      <div className="section-header">
        <h2>Security Settings</h2>
        <p>Manage your account security and password</p>
      </div>

      {securityStats && (
        <div className="security-stats">
          <div className="stat-card">
            <div className="stat-label">Last Password Change</div>
            <div className="stat-value">
              {securityStats.password_changed_at
                ? new Date(securityStats.password_changed_at).toLocaleDateString()
                : 'Never'
              }
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Login Attempts</div>
            <div className="stat-value">{securityStats.login_attempts || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Account Status</div>
            <div className="stat-value" style={{
              color: securityStats.locked_until > Date.now() ? '#dc3545' : '#28a745'
            }}>
              {securityStats.locked_until > Date.now() ? 'Locked' : 'Active'}
            </div>
          </div>
        </div>
      )}

      <div className="security-actions">
        <button
          className="btn primary"
          onClick={() => setShowChangeModal(true)}
        >
          Change Password
        </button>
      </div>

      <Modal
        show={showChangeModal}
        onClose={() => setShowChangeModal(false)}
        title="Change Password"
      >
        <div className="password-change-form">
          <div className="field">
            <label className="label">Current Password</label>
            <input
              className="input"
              type="password"
              value={form.oldPassword}
              onChange={e => setForm({ ...form, oldPassword: e.target.value })}
              placeholder="Enter your current password"
              required
            />
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
              placeholder="Enter a strong new password"
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
          {success && <div style={{ color: '#28a745', fontSize: 12, marginBottom: 10 }}>{success}</div>}

          <div className="modal-actions">
            <button
              className="btn secondary"
              onClick={() => setShowChangeModal(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="btn primary"
              onClick={changePassword}
              disabled={loading || !validation?.isValid}
            >
              {loading ? 'Changing…' : 'Change Password'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { downloadCsv } from '../services/export.js';
import Modal from '../components/Modal.jsx';

export default function Users({ user }) {
  const [users, setUsers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({ username: '', full_name: '', password: '', role: 'cashier' });
  const [editing, setEditing] = useState(null);

  function load() { api.get('/api/users').then(setUsers); }
  useEffect(() => { load(); }, []);

  const filteredUsers = users.filter(u => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return u.username.toLowerCase().includes(q)
      || (u.full_name || '').toLowerCase().includes(q)
      || u.role.toLowerCase().includes(q)
      || (u.active ? 'active' : 'inactive').includes(q);
  });

  async function save() {
    try {
      if (!form.username) return alert('Username required');
      if (!editing && !form.password) return alert('Password required for new user');
      const data = { username: form.username, full_name: form.full_name, role: form.role, actor: user.id };
      if (form.password) data.password = form.password;
      if (editing) {
        await api.put('/api/users/' + editing.id, data);
        setEditing(null);
      } else {
        await api.post('/api/users', data);
        setShowAdd(false);
      }
      setForm({ username: '', full_name: '', password: '', role: 'cashier' });
      load();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }

  async function toggleActive(u) {
    await api.put('/api/users/' + u.id, { active: !u.active, actor: user.id });
    load();
  }

  return (
    <>
      <h1>Users</h1>
      <div className="page-sub">Manage staff accounts and roles</div>

      <div className="flex between mb-16">
        <div>
          <div className="field">
            <label className="label">Search users</label>
            <input className="input" value={query} placeholder="Search username, name, role, status" onChange={e => setQuery(e.target.value)} />
          </div>
        </div>
        <div className="text-right">
          <div className="page-sub">Showing {filteredUsers.length} of {users.length} users</div>
          <div className="flex gap-8">
            <button className="btn" onClick={() => downloadCsv('users.csv', filteredUsers, [
              { key: 'username', label: 'Username' },
              { key: 'full_name', label: 'Full Name' },
              { key: 'role', label: 'Role' },
              { key: 'active', label: 'Active', value: row => (row.active ? 'Active' : 'Inactive') },
              { key: 'created_at', label: 'Created', value: row => new Date(row.created_at).toLocaleDateString() },
              { key: 'last_modified', label: 'Updated', value: row => new Date(row.last_modified || row.created_at).toLocaleDateString() }
            ])}>Export CSV</button>
            <button className="btn primary" onClick={() => { setShowAdd(true); setEditing(null); setForm({ username: '', full_name: '', password: '', role: 'cashier' }); }}>Add User</button>
          </div>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead><tr><th>Username</th><th>Full Name</th><th>Role</th><th>Status</th><th>Created</th><th>Updated</th><th></th></tr></thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.full_name || '—'}</td>
                <td><span className="badge">{u.role}</span></td>
                <td><span className={`badge ${u.active ? 'success' : 'danger'}`}>{u.active ? 'Active' : 'Inactive'}</span></td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>{new Date(u.last_modified || u.created_at).toLocaleDateString()}</td>
                <td>
                  <button className="btn sm" onClick={() => {
                    setShowAdd(false);
                    setEditing(u);
                    setForm({ username: u.username, full_name: u.full_name || '', password: '', role: u.role });
                  }}>Edit</button>
                  <button className="btn sm danger" onClick={() => toggleActive(u)}>{u.active ? 'Deactivate' : 'Activate'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(showAdd || editing) && (
        <Modal onClose={() => { setShowAdd(false); setEditing(null); setForm({ username: '', full_name: '', password: '', role: 'cashier' }); }}>
          <h3>{editing ? 'Edit User' : 'Add User'}</h3>
          <div className="field"><label className="label">Username</label><input className="input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} /></div>
          <div className="field"><label className="label">Full Name</label><input className="input" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
          <div className="field"><label className="label">Password</label><input className="input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            {editing && <small>Leave password blank to keep the current password.</small>}
          </div>
          <div className="field">
            <label className="label">Role</label>
            <select className="select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
              <option value="production">Production</option>
              <option value="store">Store</option>
            </select>
          </div>
          <div className="flex gap-8 mt-16">
            <button className="btn primary" onClick={save}>Save</button>
            <button className="btn" onClick={() => { setShowAdd(false); setEditing(null); setForm({ username: '', full_name: '', password: '', role: 'cashier' }); }}>Cancel</button>
          </div>
        </Modal>
      )}
    </>
  );
}
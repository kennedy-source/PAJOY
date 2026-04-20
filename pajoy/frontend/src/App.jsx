import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { api } from './services/api.js';
import AppLayout from './layouts/AppLayout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import POS from './pages/POS.jsx';
import Inventory from './pages/Inventory.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Schools from './pages/Schools.jsx';
import Customers from './pages/Customers.jsx';
import Suppliers from './pages/Suppliers.jsx';
import Embroidery from './pages/Embroidery.jsx';
import Printing from './pages/Printing.jsx';
import Jobs from './pages/Jobs.jsx';
import Expenses from './pages/Expenses.jsx';
import Reports from './pages/Reports.jsx';
import SalesHistory from './pages/SalesHistory.jsx';
import Settings from './pages/Settings.jsx';
import Users from './pages/Users.jsx';
import Profile from './pages/Profile.jsx';
import PasswordChange from './pages/PasswordChange.jsx';

const NAV_SECTIONS = [
  {
    section: 'Operations',
    items: [
      { to: '/', label: 'Dashboard', icon: '◈' },
      { to: '/pos', label: 'POS / Sale', icon: '⛀' },
      { to: '/sales', label: 'Sales', icon: '☷' }
    ]
  },
  {
    section: 'Catalog',
    items: [
      { to: '/inventory', label: 'Inventory', icon: '⌗' },
      { to: '/schools', label: 'Schools', icon: '⌂' }
    ]
  },
  {
    section: 'Production',
    items: [
      { to: '/jobs', label: 'Jobs', icon: '⚒' },
      { to: '/embroidery', label: 'Embroidery', icon: '✦' },
      { to: '/printing', label: 'Printing', icon: '⎙' }
    ]
  },
  {
    section: 'People',
    items: [
      { to: '/customers', label: 'Customers', icon: '☻' },
      { to: '/suppliers', label: 'Suppliers', icon: '⛟' }
    ]
  },
  {
    section: 'Finance',
    items: [
      { to: '/expenses', label: 'Expenses', icon: '⛁' },
      { to: '/reports', label: 'Reports', icon: '⎈' }
    ]
  },
  {
    section: 'System',
    items: [
      { to: '/settings', label: 'Settings', icon: '⚙' },
      { to: '/users', label: 'Users', icon: '👥' },
      { to: '/profile', label: 'Profile', icon: '👤' }
    ]
  }
];

const DEFAULT_ROUTE_BY_ROLE = {
  admin: '/',
  manager: '/',
  cashier: '/pos',
  production: '/jobs',
  store: '/inventory'
};

const ROUTES = [
  { path: '/', element: () => <Dashboard /> },
  { path: '/pos', element: user => <POS user={user} /> },
  { path: '/inventory', element: () => <Inventory /> },
  { path: '/inventory/:id', element: user => <ProductDetail user={user} /> },
  { path: '/schools', element: () => <Schools /> },
  { path: '/customers', element: () => <Customers /> },
  { path: '/suppliers', element: () => <Suppliers /> },
  { path: '/embroidery', element: () => <Embroidery /> },
  { path: '/printing', element: () => <Printing /> },
  { path: '/jobs', element: user => <Jobs user={user} /> },
  { path: '/expenses', element: user => <Expenses user={user} /> },
  { path: '/sales', element: () => <SalesHistory /> },
  { path: '/reports', element: () => <Reports /> },
  { path: '/settings', element: () => <Settings /> },
  { path: '/users', element: user => <Users user={user} /> },
  { path: '/profile', element: (user, onLogout) => <Profile user={user} onLogout={onLogout} /> }
];

const ALLOWED_ROUTES_BY_ROLE = {
  admin: ROUTES.map(route => route.path),
  manager: ['/', '/pos', '/sales', '/inventory', '/inventory/:id', '/schools', '/customers', '/suppliers', '/jobs', '/embroidery', '/printing', '/expenses', '/reports', '/settings', '/users', '/profile'],
  cashier: ['/', '/pos', '/sales', '/customers', '/profile'],
  production: ['/', '/jobs', '/embroidery', '/printing', '/profile'],
  store: ['/', '/inventory', '/inventory/:id', '/suppliers', '/profile']
};

function getAllowedPaths(role) {
  return ALLOWED_ROUTES_BY_ROLE[role] || ['/'];
}

function getAllowedNavSections(role) {
  const allowedPaths = getAllowedPaths(role);
  return NAV_SECTIONS
    .map(section => ({
      ...section,
      items: section.items.filter(item => allowedPaths.includes(item.to))
    }))
    .filter(section => section.items.length > 0);
}

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pajoy_user') || 'null'); }
    catch { return null; }
  });
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function onLogin(u) {
    localStorage.setItem('pajoy_user', JSON.stringify(u));
    setUser(u);
    if (u.requirePasswordChange) {
      setRequirePasswordChange(true);
    } else {
      navigate(DEFAULT_ROUTE_BY_ROLE[u.role] || '/');
    }
  }

  function onPasswordChanged() {
    setRequirePasswordChange(false);
    const updatedUser = { ...user, requirePasswordChange: false };
    localStorage.setItem('pajoy_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    navigate(DEFAULT_ROUTE_BY_ROLE[user.role] || '/');
  }

  function onLogout() {
    // Clear session on server
    if (user?.id) {
      api.post('/api/auth/logout', { userId: user.id }).catch(() => {});
    }
    localStorage.removeItem('pajoy_user');
    setUser(null);
    setRequirePasswordChange(false);
    navigate('/login');
  }

  useEffect(() => {
    if (!user && location.pathname !== '/login') navigate('/login');
  }, [user, location.pathname]);

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={onLogin} />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  if (requirePasswordChange) {
    return <PasswordChange user={user} onPasswordChanged={onPasswordChanged} />;
  }

  const allowedPaths = getAllowedPaths(user.role);
  const allowedNavSections = getAllowedNavSections(user.role);
  const defaultRoute = DEFAULT_ROUTE_BY_ROLE[user.role] || '/';

  return (
    <AppLayout user={user} onLogout={onLogout} navSections={allowedNavSections}>
      <Routes>
        {ROUTES.filter(route => allowedPaths.includes(route.path)).map(route => (
          <Route key={route.path} path={route.path} element={route.path === '/profile' ? route.element(user, onLogout) : route.element(user)} />
        ))}
        <Route path="*" element={<Navigate to={defaultRoute} />} />
      </Routes>
    </AppLayout>
  );
}

export default App;

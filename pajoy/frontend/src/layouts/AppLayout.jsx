import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export default function AppLayout({ user, onLogout, navSections, children }) {
  const loc = useLocation();
  const allItems = navSections.flatMap(section => section.items);
  const titleByPath = allItems.find(item => item.to === loc.pathname)?.label || 'PAJOY';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">P</div>
          <div>
            <div className="brand-name">PAJOY</div>
            <div className="brand-sub">Retail & Production</div>
          </div>
        </div>
        {navSections.map((section, sectionIndex) => (
          <React.Fragment key={section.section}>
            <div className="nav-section">{section.section}</div>
            {section.items.map(item => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}
                className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
                <span style={{ width: 18, display: 'inline-block', textAlign: 'center', opacity: .8 }}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </React.Fragment>
        ))}
      </aside>
      <main className="main">
        <div className="topbar">
          <div style={{ fontWeight: 600, fontSize: 15 }}>{titleByPath}</div>
          <div className="flex center gap-12">
            <div className="text-right">
              <div style={{ fontWeight: 600, fontSize: 13 }}>{user.full_name || user.username}</div>
              <div className="text-mute" style={{ fontSize: 11, textTransform: 'uppercase' }}>{user.role}</div>
            </div>
            <button className="btn sm" onClick={onLogout}>Logout</button>
          </div>
        </div>
        <div className="page">{children}</div>
      </main>
    </div>
  );
}

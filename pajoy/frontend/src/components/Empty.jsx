import React from 'react';
export default function Empty({ title = 'Nothing here yet', hint }) {
  return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-mute)' }}>
      <div style={{ fontSize: 36, marginBottom: 8, opacity: .4 }}>∅</div>
      <div style={{ fontWeight: 600, color: 'var(--text-dim)' }}>{title}</div>
      {hint && <div style={{ fontSize: 12, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

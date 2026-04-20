import React from 'react';
export default function Modal({ open, title, children, onClose, size = 'md', actions }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={'modal' + (size === 'lg' ? ' lg' : '')} onClick={e => e.stopPropagation()}>
        {title && <h2>{title}</h2>}
        {children}
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  );
}

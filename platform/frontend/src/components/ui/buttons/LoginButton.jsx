import React from 'react';

export default function LoginButton({ user, onClick, profileMenuRef }) {
  if (user) {
    return (
      <div className="ct-user-badge-wrapper" ref={profileMenuRef}>
        <div className="ct-user-badge" onClick={onClick}>
          <span>👤 {user.name}</span>
          {user.role === 'admin' && <span className="ct-admin-tag">ADMIN</span>}
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>▾</span>
        </div>
      </div>
    );
  }

  return (
    <div className="ct-user-badge" onClick={onClick}>
      <span>👤 LOGIN</span>
    </div>
  );
}

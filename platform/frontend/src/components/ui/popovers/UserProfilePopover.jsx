import React from 'react';
import LogoutButton from '../buttons/LogoutButton';

export default function UserProfilePopover({ user, handleLogout }) {
  return (
    <div className="ct-profile-popover" onClick={(e) => e.stopPropagation()}>
      <div className="ct-profile-name">{user.name}</div>
      <div className="ct-profile-email">{user.email}</div>
      <LogoutButton onClick={handleLogout} />
    </div>
  );
}

import React from 'react';

export default function DateFieldBox({ displayDateStr, onClick, children }) {
  return (
    <div className="ct-date-box" onClick={onClick}>
      <svg className="ct-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <div className="ct-field-content">
        <span className="ct-field-label">Departure Date</span>
        <span className="ct-field-value">{displayDateStr}</span>
      </div>
      {children}
    </div>
  );
}

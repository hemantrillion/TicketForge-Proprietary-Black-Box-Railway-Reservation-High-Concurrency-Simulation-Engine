import React from 'react';

export default function FromStationBox({ fromStation, onClick, children }) {
  return (
    <div className="ct-from-box" onClick={onClick}>
      <svg className="ct-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>
      </svg>
      <div className="ct-field-content">
        <span className="ct-field-label">From</span>
        <span className="ct-field-value">{fromStation}</span>
      </div>
      {children}
    </div>
  );
}

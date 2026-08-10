import React from 'react';

export default function DepartedKickoutModal({
  showDepartedKickout,
  setShowDepartedKickout,
  train,
  onBackToResults
}) {
  if (!showDepartedKickout) return null;

  return (
    <div className="ct-modal-bg">
      <div className="ct-auth-modal" style={{ maxWidth: '480px', textAlign: 'center' }}>
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontWeight: 900, fontSize: '1.1rem', marginBottom: '1rem' }}>
          TRAIN DEPARTED - BOOKING CLOSED
        </div>
        <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          Train <strong>{train ? train.number : '12951'} {train ? train.name : 'MUMBAI RAJDHANI EXP'}</strong> has departed station under Simulated Time. Ticket reservation for this train is now closed.
        </p>
        <button
          onClick={() => { setShowDepartedKickout(false); onBackToResults(); }}
          className="ct-auth-submit"
        >
          Return to Train Search Results →
        </button>
      </div>
    </div>
  );
}

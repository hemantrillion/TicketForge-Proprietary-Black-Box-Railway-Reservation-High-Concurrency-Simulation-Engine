import React from 'react';

export default function CoachSeatHeader({
  train,
  classCode,
  fromStation,
  toStation,
  displayDateStr,
  timerSeconds,
  onBackToResults
}) {
  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <button onClick={onBackToResults} style={{ background: 'none', border: '1px solid #cbd5e1', padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          ← Back to Trains
        </button>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
          {train ? train.number : '12951'} {train ? train.name : 'MUMBAI RAJDHANI EXP'} ({classCode})
        </h2>
        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
          {fromStation} ➔ {toStation} • {displayDateStr}
        </div>
      </div>

      <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '0.5rem 1rem', borderRadius: '8px', textAlign: 'right' }}>
        <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 800 }}>SEAT HOLD LOCK EXPIRING IN</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#dc2626' }}>{formatTimer(timerSeconds)}</div>
      </div>
    </div>
  );
}

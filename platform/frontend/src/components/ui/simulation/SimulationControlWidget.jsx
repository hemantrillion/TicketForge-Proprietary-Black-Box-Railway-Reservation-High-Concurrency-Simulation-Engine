import React, { useState } from 'react';
import { useSimulationClock } from '../../../context/SimulationClockContext';

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function SimulationControlWidget() {
  const { simDate, simSpeed, setSimSpeed, isPaused, setIsPaused } = useSimulationClock();
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (d) => {
    const day = d.getDate().toString().padStart(2, '0');
    const month = MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();
    const hrs = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    const secs = d.getSeconds().toString().padStart(2, '0');
    return `${day} ${month} ${year}, ${hrs}:${mins}:${secs}`;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 2000,
      transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
      transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* INTEGRATED SLIDING HEADER BAR */}
      <div style={{
        background: '#ffffff',
        borderBottom: '2px solid #a7f3d0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        padding: '0.65rem 2rem',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        fontSize: '0.85rem'
      }}>
        {/* LEFT SIDE: BADGE + SIM TIME */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem' }}>
            SIMULATION ENGINE
          </span>
          <span style={{ fontWeight: 800, color: '#0f172a', letterSpacing: '0.5px' }}>
            SIM TIME: <span style={{ color: '#059669', fontWeight: 900 }}>{formatDate(simDate)}</span>
          </span>
        </div>

        {/* RIGHT SIDE: SPEED SELECTOR + PAUSE BUTTON */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginLeft: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ color: '#475569', fontWeight: 700, fontSize: '0.8rem' }}>SPEED:</span>
            {[1, 2, 6, 12, 24].map(s => (
              <button
                key={s}
                onClick={() => setSimSpeed(s)}
                style={{
                  background: simSpeed === s ? '#3aa459' : '#f1f5f9',
                  color: simSpeed === s ? '#ffffff' : '#334155',
                  border: simSpeed === s ? '1px solid #27793e' : '1px solid #cbd5e1',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            style={{
              background: isPaused ? '#ea580c' : '#059669',
              color: '#ffffff',
              border: 'none',
              padding: '0.3rem 0.85rem',
              borderRadius: '6px',
              fontWeight: 800,
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            {isPaused ? 'RESUME SIMULATION' : 'PAUSE SIMULATION'}
          </button>
        </div>

        {/* SEAMLESSLY ATTACHED BOTTOM TAB ARROW */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? "Hide Simulation Header" : "Show Simulation Header"}
          style={{
            position: 'absolute',
            bottom: '-25px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#ffffff',
            color: '#059669',
            border: '2px solid #a7f3d0',
            borderTop: '2px solid #ffffff',
            marginTop: '-2px',
            zIndex: 10,
            borderBottomLeftRadius: '10px',
            borderBottomRightRadius: '10px',
            padding: '0.15rem 1.25rem',
            fontSize: '0.85rem',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 3px 6px rgba(0,0,0,0.06)'
          }}
        >
          {isOpen ? '▲' : '▼'}
        </button>
      </div>
    </div>
  );
}

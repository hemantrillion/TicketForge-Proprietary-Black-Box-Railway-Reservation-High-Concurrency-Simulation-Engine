import React from 'react';

export default function BerthLayoutGrid({
  activeCoach,
  classCode,
  isVandeBharatChairCar,
  vandeBharatRows,
  baysData,
  selectedSeats,
  handleToggleSeat
}) {
  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
          Coach {activeCoach} Physical Layout ({classCode} - {isVandeBharatChairCar ? '3x2 Chair Car Seating' : 'Sleeper Berths'})
        </h3>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: 700 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: '12px', height: '12px', background: '#ffffff', border: '2px solid #3aa459', borderRadius: '3px' }} /> Available</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: '12px', height: '12px', background: '#fce7f3', border: '2px solid #db2777', borderRadius: '3px' }} /> Ladies Quota</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: '12px', height: '12px', background: '#3aa459', borderRadius: '3px' }} /> Selected</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: '12px', height: '12px', background: '#cbd5e1', borderRadius: '3px' }} /> Occupied</span>
        </div>
      </div>

      {isVandeBharatChairCar ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {vandeBharatRows.map(row => (
            <div key={row.rowNum} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem', display: 'grid', gridTemplateColumns: '1fr 60px 1fr', alignItems: 'center' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                {row.leftTriple.map(seat => {
                  const isSelected = selectedSeats.some(s => `${s.coach}-${s.id}` === `${activeCoach}-${seat.id}`);
                  return (
                    <button
                      key={seat.id}
                      disabled={seat.isOccupied}
                      onClick={() => handleToggleSeat(seat)}
                      style={{
                        background: seat.isOccupied ? '#cbd5e1' : (isSelected ? '#3aa459' : '#ffffff'),
                        color: seat.isOccupied ? '#64748b' : (isSelected ? '#ffffff' : '#0f172a'),
                        border: seat.isOccupied ? '1px solid #94a3b8' : (isSelected ? '2px solid #27793e' : '2px solid #3aa459'),
                        borderRadius: '6px',
                        padding: '0.35rem 0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: seat.isOccupied ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{seat.num}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.8 }}>{seat.type}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8' }}>AISLE</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {row.rightDouble.map(seat => {
                  const isSelected = selectedSeats.some(s => `${s.coach}-${s.id}` === `${activeCoach}-${seat.id}`);
                  return (
                    <button
                      key={seat.id}
                      disabled={seat.isOccupied}
                      onClick={() => handleToggleSeat(seat)}
                      style={{
                        background: seat.isOccupied ? '#cbd5e1' : (isSelected ? '#3aa459' : '#ffffff'),
                        color: seat.isOccupied ? '#64748b' : (isSelected ? '#ffffff' : '#0f172a'),
                        border: seat.isOccupied ? '1px solid #94a3b8' : (isSelected ? '2px solid #27793e' : '2px solid #3aa459'),
                        borderRadius: '6px',
                        padding: '0.35rem 0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: seat.isOccupied ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{seat.num}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.8 }}>{seat.type}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {baysData.map(bay => (
            <div key={bay.bayNum} style={{ background: bay.isLadiesBay ? '#fdf2f8' : '#f8fafc', border: bay.isLadiesBay ? '1.5px solid #f472b6' : '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>BAY {bay.bayNum}</div>
                {bay.isLadiesBay && (
                  <span style={{ fontSize: '0.7rem', color: '#db2777', fontWeight: 800, background: '#fce7f3', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    LADIES QUOTA CABIN
                  </span>
                )}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 140px', gap: '1rem', alignItems: 'center' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#ffffff', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {bay.mainLeft.map(seat => {
                      const isSelected = selectedSeats.some(s => `${s.coach}-${s.id}` === `${activeCoach}-${seat.id}`);
                      return (
                        <button
                          key={seat.id}
                          disabled={seat.isOccupied}
                          onClick={() => handleToggleSeat(seat)}
                          style={{
                            background: seat.isOccupied ? '#cbd5e1' : (isSelected ? '#3aa459' : (seat.isLadies ? '#fce7f3' : '#ffffff')),
                            color: seat.isOccupied ? '#64748b' : (isSelected ? '#ffffff' : (seat.isLadies ? '#9d174d' : '#0f172a')),
                            border: seat.isOccupied ? '1px solid #94a3b8' : (isSelected ? '2px solid #27793e' : (seat.isLadies ? '2px solid #db2777' : '2px solid #3aa459')),
                            borderRadius: '6px',
                            padding: '0.35rem 0.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: seat.isOccupied ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{seat.num}</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.8 }}>{seat.type}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {bay.mainRight.map(seat => {
                      const isSelected = selectedSeats.some(s => `${s.coach}-${s.id}` === `${activeCoach}-${seat.id}`);
                      return (
                        <button
                          key={seat.id}
                          disabled={seat.isOccupied}
                          onClick={() => handleToggleSeat(seat)}
                          style={{
                            background: seat.isOccupied ? '#cbd5e1' : (isSelected ? '#3aa459' : (seat.isLadies ? '#fce7f3' : '#ffffff')),
                            color: seat.isOccupied ? '#64748b' : (isSelected ? '#ffffff' : (seat.isLadies ? '#9d174d' : '#0f172a')),
                            border: seat.isOccupied ? '1px solid #94a3b8' : (isSelected ? '2px solid #27793e' : (seat.isLadies ? '2px solid #db2777' : '2px solid #3aa459')),
                            borderRadius: '6px',
                            padding: '0.35rem 0.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: seat.isOccupied ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{seat.num}</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.8 }}>{seat.type}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '1px' }}>
                  AISLE
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', background: '#ffffff', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  {bay.sideCorridor.map(seat => {
                    const isSelected = selectedSeats.some(s => `${s.coach}-${s.id}` === `${activeCoach}-${seat.id}`);
                    return (
                      <button
                        key={seat.id}
                        disabled={seat.isOccupied}
                        onClick={() => handleToggleSeat(seat)}
                        style={{
                          background: seat.isOccupied ? '#cbd5e1' : (isSelected ? '#3aa459' : '#ffffff'),
                          color: seat.isOccupied ? '#64748b' : (isSelected ? '#ffffff' : '#0f172a'),
                          border: seat.isOccupied ? '1px solid #94a3b8' : (isSelected ? '2px solid #27793e' : '2px solid #3aa459'),
                          borderRadius: '6px',
                          padding: '0.35rem 0.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: seat.isOccupied ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{seat.num}</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.8 }}>{seat.type}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

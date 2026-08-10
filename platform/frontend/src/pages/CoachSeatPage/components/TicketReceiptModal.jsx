import React from 'react';

export default function TicketReceiptModal({
  generatedTicket,
  setGeneratedTicket,
  onBackToResults
}) {
  if (!generatedTicket) return null;

  return (
    <div className="ct-modal-bg">
      <div className="ct-auth-modal" style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ background: '#ecfdf5', color: '#065f46', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.85rem', textAlign: 'center', marginBottom: '1rem' }}>
          BOOKING CONFIRMED - ELECTRONIC RESERVATION SLIP (ERS)
        </div>

        <div style={{ border: '2px solid #3aa459', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>PNR NUMBER</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#3aa459', letterSpacing: '1px' }}>{generatedTicket.pnr}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>TRAIN DETAILS</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{generatedTicket.trainNumber} - {generatedTicket.trainName}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            <div><strong>Route:</strong> {generatedTicket.fromStation} ➔ {generatedTicket.toStation}</div>
            <div><strong>Date:</strong> {generatedTicket.displayDateStr}</div>
            <div><strong>Passenger:</strong> {generatedTicket.passengerName}</div>
            <div><strong>Seats Assigned:</strong> {generatedTicket.seats}</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#334155', fontWeight: 700 }}>
            Status: <span style={{ color: '#3aa459' }}>CONFIRMED (CNF)</span> • Charting Status: <span style={{ color: '#2563eb' }}>CHART NOT PREPARED</span>
          </div>
        </div>

        <button
          onClick={() => { setGeneratedTicket(null); onBackToResults(); }}
          className="ct-auth-submit"
        >
          Done & Return to Train Search
        </button>
      </div>
    </div>
  );
}

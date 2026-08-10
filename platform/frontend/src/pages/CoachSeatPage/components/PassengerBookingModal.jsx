import React from 'react';

export default function PassengerBookingModal({
  showPassengerModal,
  setShowPassengerModal,
  ladiesWarning,
  setLadiesWarning,
  tfrtcUser,
  setTfrtcUser,
  passengers,
  handlePassengerInputChange,
  selectedSeats,
  optFreeCancel,
  setOptFreeCancel,
  totalPrice,
  setShowPaymentModal
}) {
  if (!showPassengerModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    for (let i = 0; i < selectedSeats.length; i++) {
      const seat = selectedSeats[i];
      const pax = passengers[i];
      const effectiveGender = (seat && seat.isLadies) ? 'Female' : (pax ? pax.gender : 'Male');
      if (seat && seat.isLadies && effectiveGender === 'Male') {
        setLadiesWarning(`Seat ${seat.coach}-${seat.num} is a Ladies Quota berth. Passenger ${i + 1} must be Female.`);
        return;
      }
    }
    setLadiesWarning('');
    setShowPaymentModal(true);
  };

  return (
    <div className="ct-modal-bg" onClick={() => setShowPassengerModal(false)}>
      <div className="ct-auth-modal" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <h2 className="ct-auth-title">Passenger Details & TFRTC Login</h2>
        <p className="ct-auth-sub">Enter passenger details to complete booking.</p>
        {ladiesWarning && (
          <div style={{ background: '#fdf2f8', border: '1px solid #f472b6', color: '#9d174d', padding: '0.6rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            {ladiesWarning}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="ct-input-group">
            <label className="ct-input-label">TFRTC Username</label>
            <input className="ct-form-input" required value={tfrtcUser} onChange={(e) => setTfrtcUser(e.target.value)} placeholder="Enter TFRTC User ID" />
          </div>

          {passengers.map((p, idx) => {
            const assignedSeat = selectedSeats[idx] ? `${selectedSeats[idx].coach}-${selectedSeats[idx].num} (${selectedSeats[idx].type})` : `Unassigned`;
            return (
              <div key={idx} style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', marginBottom: '0.85rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155' }}>Passenger {idx + 1}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3aa459' }}>Seat: {assignedSeat}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input className="ct-form-input" required placeholder="Full Name" value={p.name} onChange={(e) => handlePassengerInputChange(idx, 'name', e.target.value)} />
                  <input className="ct-form-input" required placeholder="Age" type="number" value={p.age} onChange={(e) => handlePassengerInputChange(idx, 'age', e.target.value)} />
                </div>

                {selectedSeats[idx] && selectedSeats[idx].isLadies && (
                  <div style={{ fontSize: '0.75rem', color: '#db2777', fontWeight: 800, marginBottom: '0.35rem', background: '#fdf2f8', padding: '0.3rem 0.5rem', borderRadius: '4px' }}>
                    Ladies Quota Berth - Female passengers only
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <select
                    className="ct-form-input"
                    value={selectedSeats[idx] && selectedSeats[idx].isLadies ? 'Female' : p.gender}
                    onChange={(e) => handlePassengerInputChange(idx, 'gender', e.target.value)}
                    disabled={!!(selectedSeats[idx] && selectedSeats[idx].isLadies)}
                    style={{ opacity: selectedSeats[idx] && selectedSeats[idx].isLadies ? 0.7 : 1 }}
                  >
                    {!(selectedSeats[idx] && selectedSeats[idx].isLadies) && <option value="Male">Male</option>}
                    <option value="Female">Female</option>
                  </select>
                  {selectedSeats[idx] ? (
                    <select
                      className="ct-form-input"
                      value={selectedSeats[idx].type}
                      disabled
                      style={{ opacity: 0.75, cursor: 'not-allowed', background: '#f1f5f9', fontWeight: 700 }}
                    >
                      <option value={selectedSeats[idx].type}>
                        {selectedSeats[idx].type === 'UB' ? 'Upper Berth (UB)' :
                         selectedSeats[idx].type === 'MB' ? 'Middle Berth (MB)' :
                         selectedSeats[idx].type === 'LB' ? 'Lower Berth (LB)' :
                         selectedSeats[idx].type === 'SL' ? 'Side Lower (SL)' :
                         selectedSeats[idx].type === 'SU' ? 'Side Upper (SU)' :
                         selectedSeats[idx].type === 'Window' ? 'Window Seat' :
                         selectedSeats[idx].type === 'Middle' ? 'Middle Seat' :
                         selectedSeats[idx].type === 'Aisle' ? 'Aisle Seat' :
                         `${selectedSeats[idx].type} Berth`}
                      </option>
                    </select>
                  ) : (
                    <select className="ct-form-input" value={p.berthPref} onChange={(e) => handlePassengerInputChange(idx, 'berthPref', e.target.value)}>
                      <option value="Lower">Lower Berth</option>
                      <option value="Middle">Middle Berth</option>
                      <option value="Upper">Upper Berth</option>
                      <option value="Side Lower">Side Lower</option>
                    </select>
                  )}
                </div>
              </div>
            );
          })}

          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#065f46' }}>Free Cancellation Protection</div>
              <div style={{ fontSize: '0.75rem', color: '#047857' }}>Get 100% full refund on cancellation</div>
            </div>
            <input type="checkbox" checked={optFreeCancel} onChange={(e) => setOptFreeCancel(e.target.checked)} style={{ width: '18px', height: '18px' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#334155' }}>Total Fare Payable:</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#3aa459' }}>₹{totalPrice}</span>
          </div>

          <button type="submit" className="ct-auth-submit">
            Proceed to Payment Gateway →
          </button>
        </form>
      </div>
    </div>
  );
}

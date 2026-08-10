import React from 'react';

export default function PaymentConfirmationModal({
  showPaymentModal,
  bookingLoading,
  totalPrice,
  handleFinalBookingSubmit
}) {
  if (!showPaymentModal) return null;

  return (
    <div className="ct-modal-bg">
      <div className="ct-auth-modal" style={{ maxWidth: '440px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <h2 className="ct-auth-title"><span style={{color:'#0f172a'}}>Ticket</span><span style={{color:'#3aa459'}}>Forge</span> UPI Payment</h2>
        <p className="ct-auth-sub">Select your UPI provider to authorize booking.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1.5rem 0' }}>
          {['Google Pay', 'PhonePe', 'Paytm UPI', 'BHIM UPI'].map(upi => (
            <button
              key={upi}
              onClick={handleFinalBookingSubmit}
              disabled={bookingLoading}
              style={{
                background: '#f8fafc',
                border: '2px solid #3aa459',
                padding: '0.85rem',
                borderRadius: '10px',
                fontWeight: 800,
                color: '#0f172a',
                cursor: 'pointer'
              }}
            >
              {upi}
            </button>
          ))}
        </div>

        <button
          onClick={handleFinalBookingSubmit}
          disabled={bookingLoading}
          className="ct-auth-submit"
        >
          {bookingLoading ? 'Processing Reservation...' : `Pay ₹${totalPrice} & Generate Ticket`}
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSimulationClock } from '../context/SimulationClockContext';

const API_BASE = 'http://localhost:5000/api';

const STATUS_COLOR = {
  confirmed: { text: '#059669', bg: '#ecfdf5' },
  pending:   { text: '#d97706', bg: '#fffbeb' },
  cancelled: { text: '#dc2626', bg: '#fef2f2' },
};

function statusStyle(s) {
  return STATUS_COLOR[String(s).toLowerCase()] || { text: '#475569', bg: '#f1f5f9' };
}

export default function PnrStatusPage({ user, token, setCurrentPage, setPrefilledTrain }) {
  const { simDate } = useSimulationClock();
  const [activeTab, setActiveTab] = useState('SEARCH');  // 'SEARCH' | 'MY_TICKETS'

  // PNR search state
  const [pnrInput, setPnrInput]   = useState('');
  const [pnrResult, setPnrResult] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  // My Tickets state
  const [myTickets, setMyTickets]       = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [cancelLoading, setCancelLoading]   = useState(null);
  const [cancelMsg, setCancelMsg]           = useState('');

  const fetchMyTickets = useCallback(async () => {
    setTicketsLoading(true);
    // Always load from localStorage first (bookings saved client-side on confirmation)
    const lsTickets = JSON.parse(localStorage.getItem('tf_bookings') || '[]');

    // Also try API if logged in
    if (token) {
      try {
        const res = await axios.get(`${API_BASE}/bookings/user/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const apiTickets = res.data.bookings.map(b => ({ ...b, _fromApi: true })) || [];
        // Merge: prefer API data, supplement with localStorage ones not in API
        const apiPnrs = new Set(apiTickets.map(b => b.pnr_number));
        const localOnly = lsTickets.filter(b => !apiPnrs.has(b.pnr_number));
        setMyTickets([...apiTickets, ...localOnly]);
      } catch {
        setMyTickets(lsTickets);
      }
    } else {
      setMyTickets(lsTickets);
    }
    setTicketsLoading(false);
  }, [token]);

  useEffect(() => {
    // Always fetch when My Tickets tab is opened (shows localStorage even without login)
    if (activeTab === 'MY_TICKETS') fetchMyTickets();
  }, [activeTab, fetchMyTickets]);

  const handlePnrSearch = async (e) => {
    e.preventDefault();
    if (!pnrInput.trim()) return;
    setError(''); setLoading(true); setPnrResult(null);
    try {
      const res = await axios.get(`${API_BASE}/bookings/pnr/${pnrInput.trim()}`);
      setPnrResult(res.data);
    } catch (err) {
      setError(err.response?.status === 404
        ? 'PNR not found. Enter a valid PNR from a completed booking.'
        : 'Could not connect to booking server. Make sure backend is running.');
    } finally { setLoading(false); }
  };

  const handleCancel = async (booking) => {
    const fee = booking.free_cancellation ? 0 : 120;
    const confirmed = window.confirm(
      booking.free_cancellation
        ? 'Cancel this ticket? You will receive a FULL refund (Free Cancellation included).'
        : `Cancel this ticket? A cancellation fee of ₹${fee} will apply.`
    );
    if (!confirmed) return;
    setCancelLoading(booking.id);

    // Cancel in localStorage
    const lsTickets = JSON.parse(localStorage.getItem('tf_bookings') || '[]');
    const updated = lsTickets.map(b => b.pnr_number === booking.pnr_number ? {...b, status: 'cancelled'} : b);
    localStorage.setItem('tf_bookings', JSON.stringify(updated));

    // Also try API
    if (token && booking._fromApi) {
      try {
        await axios.patch(`${API_BASE}/bookings/${booking.id}/cancel`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch { /* ignore */ }
    }

    setCancelMsg('Ticket cancelled successfully. Refund will be processed within 3–5 business days.');
    setCancelLoading(null);
    fetchMyTickets();
  };

  const tabStyle = (id) => ({
    background: activeTab === id ? '#1E3A8A' : '#ffffff',
    color:      activeTab === id ? '#ffffff' : '#334155',
    border: '1px solid #cbd5e1', padding: '0.6rem 1.25rem',
    borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem'
  });

  const navigateTo = (page, trainNumber) => {
    if (setPrefilledTrain && trainNumber) setPrefilledTrain(String(trainNumber));
    if (setCurrentPage) setCurrentPage(page);
  };

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', padding: '2rem 1rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button style={tabStyle('SEARCH')} onClick={() => setActiveTab('SEARCH')}>Check PNR Status</button>
          <button style={tabStyle('MY_TICKETS')} onClick={() => setActiveTab('MY_TICKETS')}>
            My Tickets {myTickets.length > 0 ? `(${myTickets.length})` : ''}
          </button>
        </div>

        {/* ─── PNR SEARCH TAB ─── */}
        {activeTab === 'SEARCH' && (
          <>
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.75rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.35rem' }}>PNR Status</h1>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Check booking status and all booked tickets for any PNR.</p>
              <form onSubmit={handlePnrSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <input className="ct-form-input" style={{ maxWidth: '360px', flex: '1' }}
                  placeholder="Enter PNR Number (e.g. 284-XXXXXXX)"
                  value={pnrInput} onChange={(e) => setPnrInput(e.target.value)} required />
                <button className="ct-search-cta" style={{ borderRadius: '8px', padding: '0.65rem 1.5rem' }} disabled={loading}>
                  {loading ? 'CHECKING...' : 'CHECK PNR'}
                </button>
              </form>
              {error && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.75rem', fontWeight: 700 }}>{error}</div>}
            </div>

            {pnrResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Top info card */}
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>PNR Number</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#3aa459', letterSpacing: '2px' }}>{pnrResult.pnr}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Status</div>
                      <div style={{ fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase',
                        color: statusStyle(pnrResult.status).text, background: statusStyle(pnrResult.status).bg,
                        padding: '0.3rem 0.85rem', borderRadius: '6px', display: 'inline-block' }}>
                        {pnrResult.status || 'PENDING'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                    {pnrResult.train_number && (
                      <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.2rem' }}>TRAIN</div>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{pnrResult.train_number} — {pnrResult.train_name || 'N/A'}</div>
                      </div>
                    )}
                    {pnrResult.from_station && (
                      <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.2rem' }}>ROUTE</div>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{pnrResult.from_station} → {pnrResult.to_station}</div>
                      </div>
                    )}
                    {pnrResult.dept_time && (
                      <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.2rem' }}>DEPARTURE</div>
                        <div style={{ fontWeight: 800 }}>{pnrResult.dept_time}</div>
                      </div>
                    )}
                    {pnrResult.passenger_name && (
                      <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.2rem' }}>PASSENGER</div>
                        <div style={{ fontWeight: 800 }}>{pnrResult.passenger_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{pnrResult.passenger_age} yrs · {pnrResult.passenger_gender}</div>
                      </div>
                    )}
                    <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.2rem' }}>TOTAL PAID</div>
                      <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>₹{pnrResult.total_amount?.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                {/* Seats table */}
                {pnrResult.seats?.length > 0 && (
                  <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem' }}>
                      Booked Tickets ({pnrResult.seats.length} {pnrResult.seats.length === 1 ? 'seat' : 'seats'})
                    </h2>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: '#1E3A8A', color: '#ffffff' }}>
                            {['#', 'Coach', 'Seat', 'Berth Type', 'Status', 'CNF %', 'Price'].map(h => (
                              <th key={h} style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {pnrResult.seats.map((seat, i) => {
                            const cnfPct = seat.cnf_probability != null ? `${Math.round(seat.cnf_probability * 100)}%` : 'N/A';
                            const cnfColor = seat.cnf_probability >= 0.8 ? '#059669' : seat.cnf_probability >= 0.5 ? '#d97706' : '#dc2626';
                            return (
                              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: 700 }}>{i + 1}</td>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>{seat.coach || '—'}</td>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>{seat.seat_label || '—'}</td>
                                <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{seat.berth_type || '—'}</td>
                                <td style={{ padding: '0.75rem 1rem' }}>
                                  <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#059669', background: '#ecfdf5', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                                    CNF / {seat.coach} / {seat.seat_label}
                                  </span>
                                </td>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: cnfColor }}>{cnfPct}</td>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>₹{parseFloat(seat.price || 0).toFixed(2)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr style={{ background: '#f1f5f9', borderTop: '2px solid #e2e8f0' }}>
                            <td colSpan={6} style={{ padding: '0.75rem 1rem', fontWeight: 800, textAlign: 'right' }}>Total Paid:</td>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 900 }}>₹{pnrResult.total_amount?.toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '10px', padding: '0.85rem 1.25rem', fontSize: '0.85rem', fontWeight: 700, color: '#92400e' }}>
                  Chart Status: CHART NOT PREPARED · Booked on {pnrResult.created_at ? new Date(pnrResult.created_at).toLocaleString() : '-'}
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── MY TICKETS TAB ─── */}
        {activeTab === 'MY_TICKETS' && (
          <>
            {!user ? (
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '2rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>Login Required</div>
                <p style={{ color: '#64748b', marginBottom: '1.25rem' }}>Please log in to view your booked tickets.</p>
              </div>
            ) : (
              <>
                {cancelMsg && (
                  <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 800, color: '#065f46' }}>
                    {cancelMsg}
                  </div>
                )}

                {ticketsLoading ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontWeight: 700 }}>Loading your tickets...</div>
                ) : myTickets.length === 0 ? (
                  <div style={{ background: '#ffffff', borderRadius: '12px', padding: '2.5rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>No Tickets Found</div>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Book a train ticket to see it here instantly after payment.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {myTickets.map((booking, i) => {
                      const sc = statusStyle(booking.status);
                      const isCancelled = String(booking.status).toLowerCase() === 'cancelled';
                      return (
                        <div key={booking.id || i} style={{ background: '#ffffff', borderRadius: '12px', padding: '1.35rem 1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
                            <div>
                              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#3aa459', letterSpacing: '1px' }}>{booking.pnr_number}</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>
                                {booking.train_number ? `${booking.train_number} — ` : ''}{booking.train_name || 'Train'}
                              </div>
                              {booking.from_station && (
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.1rem' }}>
                                  {booking.from_station} → {booking.to_station}
                                  {booking.dept_time ? ` · Dept ${booking.dept_time}` : ''}
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                              <span style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', color: sc.text, background: sc.bg, padding: '0.25rem 0.65rem', borderRadius: '5px' }}>
                                {booking.status}
                              </span>
                              <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '1rem' }}>₹{booking.total_amount?.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Seats */}
                          {booking.seats?.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                              {booking.seats.map((s, si) => (
                                <span key={si} style={{ background: '#ecfdf5', color: '#059669', fontWeight: 800, fontSize: '0.78rem', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                                  {s.coach}/{s.seat_label} ({s.berth_type})
                                </span>
                              ))}
                            </div>
                          )}

                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                            Passenger: {booking.passenger_name || '—'} · Booked: {booking.created_at ? new Date(booking.created_at).toLocaleString() : '—'}
                          </div>

                          {/* Action buttons */}
                          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                            {booking.train_number && (
                              <>
                                <button
                                  onClick={() => navigateTo('running', booking.train_number)}
                                  style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '0.4rem 0.85rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}>
                                  Live Status
                                </button>
                                <button
                                  onClick={() => navigateTo('schedule', booking.train_number)}
                                  style={{ background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', padding: '0.4rem 0.85rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}>
                                  Schedule
                                </button>
                              </>
                            )}
                            {!isCancelled && (
                              <button
                                onClick={() => handleCancel(booking)}
                                disabled={cancelLoading === booking.id}
                                style={{
                                  background: booking.free_cancellation ? '#fef2f2' : '#fff7ed',
                                  color: booking.free_cancellation ? '#dc2626' : '#d97706',
                                  border: `1px solid ${booking.free_cancellation ? '#fca5a5' : '#fed7aa'}`,
                                  padding: '0.4rem 0.85rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer'
                                }}>
                                {cancelLoading === booking.id ? 'Cancelling...' : booking.free_cancellation ? '✕ Cancel (Free)' : '✕ Cancel (₹120 fee)'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

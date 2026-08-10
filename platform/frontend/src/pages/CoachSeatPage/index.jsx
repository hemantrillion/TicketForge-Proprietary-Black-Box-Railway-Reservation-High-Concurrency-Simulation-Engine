import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSimulationClock } from '../../context/SimulationClockContext';
import {
  GENERATE_VANDE_BHARAT_CC,
  GENERATE_DYNAMIC_3A_BAYS,
  GENERATE_DYNAMIC_2A_BAYS
} from './helpers/SeatLayoutGenerators';

import CoachSeatHeader from './components/CoachSeatHeader';
import BerthLayoutGrid from './components/BerthLayoutGrid';
import PassengerBookingModal from './components/PassengerBookingModal';
import PaymentConfirmationModal from './components/PaymentConfirmationModal';
import TicketReceiptModal from './components/TicketReceiptModal';
import DepartedKickoutModal from './components/DepartedKickoutModal';

const API_BASE = 'http://localhost:5000/api';

export default function CoachSeatPage({ train, selectedClass, fromStation, toStation, journeyDate, displayDateStr, onBackToResults, user, token }) {
  const { simDate } = useSimulationClock();
  const classCode = selectedClass ? selectedClass.code : '3A';
  
  const availableCoaches = (train && train.rakes)
    ? train.rakes.filter(r => {
        if (classCode === '1A') return r.startsWith('H');
        if (classCode === '2A') return r.startsWith('A');
        if (classCode === '3A') return r.startsWith('B');
        if (classCode === 'SL') return r.startsWith('S');
        if (classCode === 'CC') return r.startsWith('C') || r.startsWith('CC');
        if (classCode === 'EC') return r.startsWith('E');
        return true;
      })
    : ['B1', 'B2', 'B3', 'B4', 'B5'];

  const [activeCoach, setActiveCoach] = useState(availableCoaches[0] || 'B1');
  const [passengerCount, setPassengerCount] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [timerSeconds, setTimerSeconds] = useState(300);

  // Departed Modal State
  const [showDepartedKickout, setShowDepartedKickout] = useState(false);

  // Form & Ticket State
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [tfrtcUser, setTfrtcUser] = useState('tfrtc_user_2026');
  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: 'Male', berthPref: 'Lower' }]);
  const [optFreeCancel, setOptFreeCancel] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [ladiesWarning, setLadiesWarning] = useState('');

  // DYNAMIC DEPARTURE KICK-OUT MECHANIC:
  useEffect(() => {
    if (!train) return;
    const simTimeMs = simDate.getTime();
    
    const targetB0 = journeyDate || new Date(2026, 7, 13);
    const trainDeptMs = new Date(targetB0.getFullYear(), targetB0.getMonth(), targetB0.getDate(), train.deptHour || 16, train.deptMin || 55, 0).getTime();
    
    if (simTimeMs > trainDeptMs) {
      setShowDepartedKickout(true);
    }
  }, [simDate, train, journeyDate]);

  // 5-Minute Timer
  useEffect(() => {
    const interval = setInterval(() => setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSeat = (seatObj) => {
    const seatKey = `${activeCoach}-${seatObj.id}`;
    const exists = selectedSeats.some(s => `${s.coach}-${s.id}` === seatKey);

    if (exists) {
      setLadiesWarning('');
      setSelectedSeats(selectedSeats.filter(s => `${s.coach}-${s.id}` !== seatKey));
    } else {
      if (seatObj.isLadies) {
        setLadiesWarning('Ladies Quota seat selected - only Female passengers may be assigned to this berth.');
      } else {
        setLadiesWarning('');
      }
      if (selectedSeats.length < passengerCount) {
        setSelectedSeats([...selectedSeats, { coach: activeCoach, ...seatObj }]);
      }
    }
  };

  const handlePassengerCountChange = (count) => {
    setPassengerCount(count);
    setSelectedSeats([]);
    const newPass = Array.from({ length: count }, (_, i) => passengers[i] || { name: '', age: '', gender: 'Male', berthPref: 'Lower' });
    setPassengers(newPass);
  };

  const handlePassengerInputChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleFinalBookingSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setBookingLoading(true);

    const seatDesc = selectedSeats.map((s) => `${s.coach}-${s.num} (${s.type})`).join(', ');

    try {
      const res = await axios.post(`${API_BASE}/bookings`, {
        user_id: user ? user.id : 1,
        event_id: train ? parseInt(train.id) : 101,
        seat_ids: selectedSeats.map(s => s.id),
        passenger_name: passengers[0].name || 'Passenger 1',
        passenger_age: parseInt(passengers[0].age) || 28
      });

      const pnr = res.data.pnr_number || `284-${Math.floor(1000000 + Math.random() * 9000000)}`;
      const ticket = {
        pnr,
        trainName: train ? train.name : 'MUMBAI RAJDHANI EXP',
        trainNumber: train ? train.number : '12951',
        fromStation,
        toStation,
        displayDateStr,
        seats: seatDesc || `${activeCoach}-12 (LB)`,
        passengerName: passengers[0].name || 'Passenger 1',
        amountPaid: selectedClass ? selectedClass.price * passengerCount + (optFreeCancel ? 199 * passengerCount : 0) : 2150
      };

      const lsBooking = {
        id: Date.now(),
        pnr_number: pnr,
        train_number: train ? String(train.number) : '12951',
        train_name: train ? train.name : 'MUMBAI RAJDHANI EXP',
        from_station: fromStation,
        to_station: toStation,
        dept_time: train ? (train.deptTime || '') : '',
        passenger_name: passengers[0].name || 'Passenger 1',
        passenger_age: passengers[0].age || 28,
        passenger_gender: passengers[0].gender || 'Male',
        status: 'confirmed',
        total_amount: selectedClass ? selectedClass.price * passengerCount + (optFreeCancel ? 199 * passengerCount : 0) : 2150,
        free_cancellation: optFreeCancel,
        seats: selectedSeats.map(s => ({ coach: s.coach, seat_label: String(s.num), berth_type: s.type, price: selectedClass ? selectedClass.price : 0, cnf_probability: 0.92 })),
        created_at: new Date().toISOString()
      };
      const prev = JSON.parse(localStorage.getItem('tf_bookings') || '[]');
      localStorage.setItem('tf_bookings', JSON.stringify([lsBooking, ...prev]));

      setGeneratedTicket(ticket);
      setShowPaymentModal(false);
      setShowPassengerModal(false);
    } catch (err) {
      const pnr = `284-${Math.floor(1000000 + Math.random() * 9000000)}`;
      const lsBooking = {
        id: Date.now(),
        pnr_number: pnr,
        train_number: train ? String(train.number) : '12951',
        train_name: train ? train.name : 'MUMBAI RAJDHANI EXP',
        from_station: fromStation,
        to_station: toStation,
        dept_time: train ? (train.deptTime || '') : '',
        passenger_name: passengers[0].name || 'Passenger 1',
        passenger_age: passengers[0].age || 28,
        passenger_gender: passengers[0].gender || 'Male',
        status: 'confirmed',
        total_amount: selectedClass ? selectedClass.price * passengerCount + (optFreeCancel ? 199 * passengerCount : 0) : 2150,
        free_cancellation: optFreeCancel,
        seats: selectedSeats.map(s => ({ coach: s.coach, seat_label: String(s.num), berth_type: s.type, price: selectedClass ? selectedClass.price : 0, cnf_probability: 0.92 })),
        created_at: new Date().toISOString()
      };
      const prev = JSON.parse(localStorage.getItem('tf_bookings') || '[]');
      localStorage.setItem('tf_bookings', JSON.stringify([lsBooking, ...prev]));

      setGeneratedTicket({
        pnr,
        trainName: train ? train.name : 'MUMBAI RAJDHANI EXP',
        trainNumber: train ? train.number : '12951',
        fromStation,
        toStation,
        displayDateStr,
        seats: seatDesc || `${activeCoach}-12 (LB)`,
        passengerName: passengers[0].name || 'Passenger 1',
        amountPaid: selectedClass ? selectedClass.price * passengerCount + (optFreeCancel ? 199 * passengerCount : 0) : 2150
      });
      setShowPaymentModal(false);
      setShowPassengerModal(false);
    } finally {
      setBookingLoading(false);
    }
  };

  const basePrice = selectedClass ? selectedClass.price : 2150;
  const totalPrice = basePrice * passengerCount + (optFreeCancel ? 199 * passengerCount : 0);

  const baseTime = new Date(simDate.getFullYear(), simDate.getMonth(), simDate.getDate(), 6, 0, 0).getTime();
  const currentSimTime = simDate.getTime();
  const simHoursElapsed = Math.max(0, (currentSimTime - baseTime) / (1000 * 60 * 60));

  const trainId = train ? train.number : '12951';

  const isVandeBharatChairCar = classCode === 'CC' || classCode === 'EC';
  const vandeBharatRows = isVandeBharatChairCar ? GENERATE_VANDE_BHARAT_CC(trainId, activeCoach, simHoursElapsed) : [];

  const baysData = !isVandeBharatChairCar
    ? (classCode.startsWith('2A')
        ? GENERATE_DYNAMIC_2A_BAYS(trainId, activeCoach, simHoursElapsed)
        : GENERATE_DYNAMIC_3A_BAYS(trainId, activeCoach, simHoursElapsed))
    : [];

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', paddingBottom: '4rem' }}>
      <CoachSeatHeader
        train={train}
        classCode={classCode}
        fromStation={fromStation}
        toStation={toStation}
        displayDateStr={displayDateStr}
        timerSeconds={timerSeconds}
        onBackToResults={onBackToResults}
      />

      <div style={{ maxWidth: '1100px', margin: '1.5rem auto', padding: '0 1rem' }}>
        {/* PASSENGER COUNTER & MULTI-COACH SELECTOR BAR */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Passengers ({passengerCount}) & Authentic Rake Selection</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Select coach and seats. Real TFRTC rake composition for this train.</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Passengers:</span>
              {[1, 2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  onClick={() => handlePassengerCountChange(num)}
                  style={{
                    background: passengerCount === num ? '#3aa459' : '#f1f5f9',
                    color: passengerCount === num ? '#ffffff' : '#334155',
                    border: 'none',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {num}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Coach:</span>
              {availableCoaches.map(c => (
                <button
                  key={c}
                  onClick={() => setActiveCoach(c)}
                  style={{
                    background: activeCoach === c ? '#0f172a' : '#e2e8f0',
                    color: activeCoach === c ? '#ffffff' : '#334155',
                    border: 'none',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <BerthLayoutGrid
          activeCoach={activeCoach}
          classCode={classCode}
          isVandeBharatChairCar={isVandeBharatChairCar}
          vandeBharatRows={vandeBharatRows}
          baysData={baysData}
          selectedSeats={selectedSeats}
          handleToggleSeat={handleToggleSeat}
        />

        {/* BOTTOM ACTION BAR */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem 1.5rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Selected Seats ({selectedSeats.length}/{passengerCount}):</div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
              {selectedSeats.length > 0
                ? selectedSeats.map(s => `${s.coach}-${s.num} (${s.type})`).join(', ')
                : 'None Selected'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'right' }}>Total Base Fare</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#3aa459' }}>₹{basePrice * passengerCount}</div>
            </div>

            <button
              onClick={() => setShowPassengerModal(true)}
              style={{
                background: '#3aa459',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              Proceed to Passenger Details →
            </button>
          </div>
        </div>
      </div>

      <DepartedKickoutModal
        showDepartedKickout={showDepartedKickout}
        setShowDepartedKickout={setShowDepartedKickout}
        train={train}
        onBackToResults={onBackToResults}
      />

      <PassengerBookingModal
        showPassengerModal={showPassengerModal}
        setShowPassengerModal={setShowPassengerModal}
        ladiesWarning={ladiesWarning}
        setLadiesWarning={setLadiesWarning}
        tfrtcUser={tfrtcUser}
        setTfrtcUser={setTfrtcUser}
        passengers={passengers}
        handlePassengerInputChange={handlePassengerInputChange}
        selectedSeats={selectedSeats}
        optFreeCancel={optFreeCancel}
        setOptFreeCancel={setOptFreeCancel}
        totalPrice={totalPrice}
        setShowPaymentModal={setShowPaymentModal}
      />

      <PaymentConfirmationModal
        showPaymentModal={showPaymentModal}
        bookingLoading={bookingLoading}
        totalPrice={totalPrice}
        handleFinalBookingSubmit={handleFinalBookingSubmit}
      />

      <TicketReceiptModal
        generatedTicket={generatedTicket}
        setGeneratedTicket={setGeneratedTicket}
        onBackToResults={onBackToResults}
      />
    </div>
  );
}

const express = require('express');
const router = express.Router();
const { pool, redis } = require('../../config/db');
const { authenticateToken } = require('../user-service/index');

function generateConfirmTktPNR() {
  const prefix = Math.floor(200 + Math.random() * 700);
  const suffix = Math.floor(1000000 + Math.random() * 9000000);
  return `${prefix}-${suffix}`;
}

// POST /api/bookings - ConfirmTkt Reservation Engine
router.post('/bookings', authenticateToken, async (req, res) => {
  const user_id = req.user.id;
  const idempotency_key = req.headers['x-idempotency-key'];
  const { event_id, seat_ids, passenger_name, passenger_age, passenger_gender, berth_pref, irctc_username, free_cancellation } = req.body;

  if (!idempotency_key) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'X-Idempotency-Key header is required' });
  }
  if (!event_id || !seat_ids || !Array.isArray(seat_ids) || seat_ids.length === 0) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Event ID and at least one Seat/Berth ID required' });
  }

  // Idempotency Check
  try {
    const existingBooking = await pool.query(
      'SELECT id, pnr_number, user_id, event_id, passenger_name, passenger_age, passenger_gender, berth_pref, irctc_username, free_cancellation, status, total_amount, idempotency_key, created_at FROM bookings WHERE idempotency_key = $1',
      [idempotency_key]
    );

    if (existingBooking.rows.length > 0) {
      return res.status(200).json({
        message: 'Duplicate request - returned existing ConfirmTkt reservation',
        booking: existingBooking.rows[0]
      });
    }
  } catch (err) {
    console.error('Idempotency check error:', err);
  }

  // Verify active Redis TTL seat hold
  for (const seat_id of seat_ids) {
    const holdKey = `seat_hold:${seat_id}`;
    const holdDataRaw = await redis.get(holdKey);
    if (!holdDataRaw) {
      return res.status(400).json({ error: 'HOLD_EXPIRED', message: `Berth ${seat_id} hold has expired or was not claimed.` });
    }
    const holdData = JSON.parse(holdDataRaw);
    if (holdData.user_id !== user_id) {
      return res.status(403).json({ error: 'UNAUTHORIZED_HOLD', message: `Berth ${seat_id} is held by another user.` });
    }
  }

  const pnr_number = generateConfirmTktPNR();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const seatsResult = await client.query(
      'SELECT id, price FROM seats WHERE id = ANY($1::uuid[]) FOR UPDATE',
      [seat_ids]
    );

    let total_amount = 0;
    seatsResult.rows.forEach(s => {
      total_amount += parseFloat(s.price);
    });

    if (free_cancellation) {
      total_amount += 199.00; // ConfirmTkt Free Cancellation addon fee
    }

    const bookingResult = await client.query(
      `INSERT INTO bookings (pnr_number, user_id, event_id, passenger_name, passenger_age, passenger_gender, berth_pref, irctc_username, free_cancellation, status, idempotency_key, total_amount) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING id, pnr_number, user_id, event_id, passenger_name, passenger_age, passenger_gender, berth_pref, irctc_username, free_cancellation, status, total_amount, idempotency_key, created_at`,
      [
        pnr_number, user_id, event_id, 
        passenger_name || 'Passenger', 
        passenger_age || 30, 
        passenger_gender || 'Male', 
        berth_pref || 'Lower Berth (LB)',
        irctc_username || 'confirmtkt_user',
        free_cancellation !== false,
        'pending', idempotency_key, total_amount
      ]
    );

    const booking = bookingResult.rows[0];

    for (const seat_id of seat_ids) {
      await client.query(
        'INSERT INTO booking_seats (booking_id, seat_id) VALUES ($1, $2)',
        [booking.id, seat_id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      booking_id: booking.id,
      pnr_number: booking.pnr_number,
      user_id: booking.user_id,
      event_id: booking.event_id,
      passenger_name: booking.passenger_name,
      passenger_age: booking.passenger_age,
      passenger_gender: booking.passenger_gender,
      berth_pref: booking.berth_pref,
      irctc_username: booking.irctc_username,
      free_cancellation: booking.free_cancellation,
      status: booking.status,
      total_amount: parseFloat(booking.total_amount),
      idempotency_key: booking.idempotency_key,
      created_at: booking.created_at
    });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ error: 'DUPLICATE_BOOKING', message: 'Berth already booked or idempotency conflict' });
    }
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to create ConfirmTkt booking' });
  } finally {
    client.release();
  }
});

// PATCH /api/bookings/:id/cancel — cancel a booking
router.patch('/bookings/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const bookingResult = await pool.query(
      'SELECT id, user_id, status, free_cancellation FROM bookings WHERE id = $1',
      [req.params.id]
    );
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Booking not found' });
    }
    const booking = bookingResult.rows[0];
    if (booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Not your booking' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'ALREADY_CANCELLED', message: 'Booking already cancelled' });
    }
    await pool.query('UPDATE bookings SET status = $1 WHERE id = $2', ['cancelled', booking.id]);
    res.json({ message: 'Booking cancelled successfully', free_cancellation: booking.free_cancellation });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to cancel booking' });
  }
});

// GET /api/bookings/pnr/:pnr  — lookup booking by PNR number with all seats
router.get('/bookings/pnr/:pnr', async (req, res) => {
  try {
    const bookingResult = await pool.query(
      `SELECT b.id, b.pnr_number, b.user_id, b.event_id, b.passenger_name, b.passenger_age,
              b.passenger_gender, b.berth_pref, b.irctc_username, b.free_cancellation,
              b.status, b.total_amount, b.created_at,
              e.title as train_name, e.number as train_number,
              e.from_station, e.to_station, e.dept_time, e.arr_time, e.duration, e.journey_date
       FROM bookings b
       LEFT JOIN events e ON b.event_id = e.id
       WHERE b.pnr_number = $1`,
      [req.params.pnr]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'PNR not found in database.' });
    }

    const booking = bookingResult.rows[0];

    const seatsResult = await pool.query(`
      SELECT s.id as seat_id, s.coach, s.seat_label, s.berth_type, s.section, s.price, s.cnf_probability
      FROM booking_seats bs
      JOIN seats s ON bs.seat_id = s.id
      WHERE bs.booking_id = $1
      ORDER BY s.coach, s.seat_label
    `, [booking.id]);

    res.json({
      pnr: booking.pnr_number,
      status: booking.status,
      total_amount: parseFloat(booking.total_amount),
      created_at: booking.created_at,
      passenger_name: booking.passenger_name,
      passenger_age: booking.passenger_age,
      passenger_gender: booking.passenger_gender,
      berth_pref: booking.berth_pref,
      irctc_username: booking.irctc_username,
      free_cancellation: booking.free_cancellation,
      train_name: booking.train_name,
      train_number: booking.train_number,
      from_station: booking.from_station,
      to_station: booking.to_station,
      dept_time: booking.dept_time,
      arr_time: booking.arr_time,
      duration: booking.duration,
      journey_date: booking.journey_date,
      seats: seatsResult.rows
    });
  } catch (err) {
    console.error('PNR lookup error:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to fetch PNR status' });
  }
});

// GET /api/bookings/user/all — list ALL bookings for the logged-in user
router.get('/bookings/user/all', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.pnr_number, b.passenger_name, b.status, b.total_amount, b.created_at,
              b.berth_pref, b.free_cancellation,
              e.title as train_name, e.number as train_number,
              e.from_station, e.to_station, e.dept_time, e.arr_time, e.journey_date
       FROM bookings b
       LEFT JOIN events e ON b.event_id = e.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    // For each booking, also fetch its seats
    const bookingsWithSeats = await Promise.all(result.rows.map(async (booking) => {
      const seatsResult = await pool.query(`
        SELECT s.coach, s.seat_label, s.berth_type, s.price, s.cnf_probability
        FROM booking_seats bs
        JOIN seats s ON bs.seat_id = s.id
        WHERE bs.booking_id = $1
        ORDER BY s.coach, s.seat_label
      `, [booking.id]);

      return {
        ...booking,
        total_amount: parseFloat(booking.total_amount),
        seats: seatsResult.rows
      };
    }));

    res.json({ bookings: bookingsWithSeats, total: bookingsWithSeats.length });
  } catch (err) {
    console.error('User bookings fetch error:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to fetch user bookings' });
  }
});

// GET /api/bookings/:id
router.get('/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const bookingResult = await pool.query(
      'SELECT id, pnr_number, user_id, event_id, passenger_name, passenger_age, passenger_gender, berth_pref, irctc_username, free_cancellation, status, total_amount, idempotency_key, created_at FROM bookings WHERE id = $1',
      [req.params.id]
    );
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];
    const seatsResult = await pool.query(`
      SELECT s.id as seat_id, s.coach, s.seat_label, s.berth_type, s.section, s.price, s.cnf_probability
      FROM booking_seats bs
      JOIN seats s ON bs.seat_id = s.id
      WHERE bs.booking_id = $1
    `, [booking.id]);

    res.json({
      ...booking,
      total_amount: parseFloat(booking.total_amount),
      seats: seatsResult.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to fetch booking' });
  }
});

module.exports = router;

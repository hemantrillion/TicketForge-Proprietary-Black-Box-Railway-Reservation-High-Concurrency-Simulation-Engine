const express = require('express');
const router = express.Router();
const { pool, redis } = require('../../config/db');
const { authenticateToken } = require('../user-service/index');

// POST /api/payments - Submit Mock Payment
router.post('/payments', authenticateToken, async (req, res) => {
  const { booking_id, amount, card_token } = req.body;

  if (!booking_id || !amount) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Booking ID and Amount required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch booking
    const bookingRes = await client.query(
      'SELECT id, user_id, status, total_amount FROM bookings WHERE id = $1 FOR UPDATE',
      [booking_id]
    );

    if (bookingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Booking not found' });
    }

    const booking = bookingRes.rows[0];

    if (booking.user_id !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Booking belongs to another user' });
    }

    if (booking.status === 'confirmed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'ALREADY_PAID', message: 'Booking is already paid and confirmed' });
    }

    // Process Mock Payment (Always succeeds for valid token)
    const providerReference = `MOCK_TXN_${Date.now()}`;
    const paymentRes = await client.query(
      'INSERT INTO payments (booking_id, amount, status, provider_reference) VALUES ($1, $2, $3, $4) RETURNING id, booking_id, amount, status, provider_reference, created_at',
      [booking_id, amount, 'success', providerReference]
    );

    const payment = paymentRes.rows[0];

    // Update booking status to confirmed
    await client.query('UPDATE bookings SET status = $1 WHERE id = $2', ['confirmed', booking_id]);

    // Update seats status to booked in PostgreSQL and release Redis hold
    const seatsRes = await client.query('SELECT seat_id FROM booking_seats WHERE booking_id = $1', [booking_id]);
    for (const row of seatsRes.rows) {
      await client.query('UPDATE seats SET status = $1 WHERE id = $2', ['booked', row.seat_id]);
      await redis.del(`seat_hold:${row.seat_id}`);
    }

    await client.query('COMMIT');

    res.status(200).json({
      payment_id: payment.id,
      booking_id: payment.booking_id,
      status: payment.status,
      provider_reference: payment.provider_reference
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Payment error:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Payment processing failed' });
  } finally {
    client.release();
  }
});

module.exports = router;

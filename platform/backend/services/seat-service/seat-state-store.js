const express = require('express');
const router = express.Router();
const { pool, redis } = require('../../config/db');
const { authenticateToken } = require('../user-service/index');

const HOLD_TTL_SECONDS = 300; // 5 minutes TTL

// GET /api/events/:event_id/seats - Get seat grid for event
router.get('/events/:event_id/seats', async (req, res) => {
  const { event_id } = req.params;
  try {
    const dbSeats = await pool.query(
      'SELECT id, seat_label, section, price, status FROM seats WHERE event_id = $1 ORDER BY seat_label ASC',
      [event_id]
    );

    // Merge with live Redis TTL holds
    const seats = await Promise.all(dbSeats.rows.map(async (seat) => {
      const holdKey = `seat_hold:${seat.id}`;
      const isHeldInRedis = await redis.exists(holdKey);
      
      let status = seat.status;
      if (status !== 'booked' && isHeldInRedis) {
        status = 'held';
      }
      return {
        id: seat.id,
        seat_label: seat.seat_label,
        section: seat.section,
        price: parseFloat(seat.price),
        status
      };
    }));

    res.json(seats);
  } catch (err) {
    console.error('Fetch seats error:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to fetch seats' });
  }
});

// POST /api/seats/:id/hold - Atomic Redis TTL Seat Hold
router.post('/seats/:id/hold', authenticateToken, async (req, res) => {
  const seat_id = req.params.id;
  const user_id = req.user.id;
  const session_id = req.body.session_id || `sess_${Date.now()}`;
  const holdKey = `seat_hold:${seat_id}`;

  try {
    // Check if seat is booked in Postgres
    const seatCheck = await pool.query('SELECT id, status FROM seats WHERE id = $1', [seat_id]);
    if (seatCheck.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Seat not found' });
    }
    if (seatCheck.rows[0].status === 'booked') {
      return res.status(409).json({ error: 'SEAT_ALREADY_BOOKED', message: 'Seat is permanently booked' });
    }

    // Atomic Set-If-Not-Exists (SETNX) with TTL in Redis
    const lockAcquired = await redis.set(holdKey, JSON.stringify({ user_id, session_id }), 'EX', HOLD_TTL_SECONDS, 'NX');

    if (!lockAcquired) {
      return res.status(409).json({ error: 'SEAT_ALREADY_HELD', message: 'Seat is currently held by another user.' });
    }

    // Record hold in Postgres durable table
    const expiresAt = new Date(Date.now() + HOLD_TTL_SECONDS * 1000);
    const holdRecord = await pool.query(
      'INSERT INTO seat_holds (seat_id, user_id, session_id, expires_at) VALUES ($1, $2, $3, $4) RETURNING id',
      [seat_id, user_id, session_id, expiresAt]
    );

    res.status(201).json({
      hold_id: holdRecord.rows[0].id,
      seat_id,
      expires_at: expiresAt.toISOString(),
      status: 'held'
    });
  } catch (err) {
    console.error('Hold seat error:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to hold seat' });
  }
});

// DELETE /api/seats/:id/hold - Release Seat Hold
router.delete('/seats/:id/hold', authenticateToken, async (req, res) => {
  const seat_id = req.params.id;
  const holdKey = `seat_hold:${seat_id}`;

  try {
    await redis.del(holdKey);
    res.json({ seat_id, status: 'available' });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to release seat hold' });
  }
});

module.exports = router;

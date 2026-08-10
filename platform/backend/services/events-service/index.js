const express = require('express');
const router = express.Router();
const { pool } = require('../../config/db');

// GET /api/events - List all events
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.id, e.venue_id, v.name as venue_name, e.title, e.description, e.starts_at, e.status
      FROM events e
      JOIN venues v ON e.venue_id = v.id
      ORDER BY e.starts_at ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch events error:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to fetch events' });
  }
});

// GET /api/events/:id - Get specific event details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT e.id, e.title, e.description, e.starts_at, e.status,
             v.id as venue_id, v.name as venue_name, v.address, v.total_capacity
      FROM events e
      JOIN venues v ON e.venue_id = v.id
      WHERE e.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Event not found' });
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      title: row.title,
      description: row.description,
      starts_at: row.starts_at,
      status: row.status,
      venue: {
        id: row.venue_id,
        name: row.venue_name,
        address: row.address,
        total_capacity: row.total_capacity
      }
    });
  } catch (err) {
    console.error('Fetch event details error:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to fetch event details' });
  }
});

module.exports = router;

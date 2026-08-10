const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_ticketforge_key_2026';

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'FORBIDDEN', message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Email, password, and name required' });
  }

  // Validate Email Format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Invalid email format' });
  }

  // Rule: Any user registering with a .in domain email (e.g. user@gmail.in, admin@company.in) gets Admin Role
  const isDotInDomain = email.toLowerCase().trim().endsWith('.in');
  const userRole = isDotInDomain ? 'admin' : 'user';

  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email.toLowerCase().trim(), password_hash, name, userRole]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ user, token });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'CONFLICT', message: 'Email already registered' });
    }
    console.error('Registration error:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to register user' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Email and password required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, role FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to fetch user profile' });
  }
});

module.exports = { router, authenticateToken };

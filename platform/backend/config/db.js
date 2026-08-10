const { Pool } = require('pg');
const Redis = require('ioredis');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ticketforge',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgrespassword',
});

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  lazyConnect: true,
});

redis.connect().catch((err) => {
  console.warn('Redis connection failed initially, retrying in background:', err.message);
});

module.exports = { pool, redis };

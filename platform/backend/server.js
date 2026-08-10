const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { router: userRouter } = require('./services/user-service/index');
const eventsRouter = require('./services/events-service/index');
const seatsRouter = require('./services/seat-service/seat-state-store');
const bookingRouter = require('./services/booking-service/create-booking');
const paymentRouter = require('./services/payment-service/payment-provider-adapter');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'TicketForge Backend V1 Phase 0' });
});

// Mount Microservice API Routers
app.use('/api/auth', userRouter);
app.use('/api/events', eventsRouter);
app.use('/api', seatsRouter);
app.use('/api', bookingRouter);
app.use('/api', paymentRouter);

// Start server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  TicketForge Platform Backend listening on port ${PORT}`);
  console.log(`  Phase 0 Foundation Services Active`);
  console.log(`====================================================`);
});

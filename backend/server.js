require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const connectDB = require('./config/db');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const errorHandler = require('./middleware/errorHandler');
const Doctor = require('./models/Doctor');

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS policy: origin "${origin}" not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Hospital Appointment Scheduler API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Hospital Appointment Scheduler API',
    version: '1.0.0',
    endpoints: {
      doctors: '/api/doctors',
      appointments: '/api/appointments',
      health: '/health',
    },
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Daily Reset Cron Job (midnight) ─────────────────────────────────────────
cron.schedule(
  '0 0 * * *',
  async () => {
    try {
      const result = await Doctor.updateMany(
        { isActive: true },
        { $set: { currentAppointments: 0, lastResetDate: new Date() } }
      );
      console.log(`[CRON] Daily reset: ${result.modifiedCount} doctor(s) reset at midnight`);
    } catch (err) {
      console.error('[CRON] Daily reset failed:', err.message);
    }
  },
  { timezone: 'UTC' }
);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;

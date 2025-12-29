require('dotenv').config();
const express = require('express');
const cors = require('cors');
const countryRoutes = require('./routes/countryRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(express.json());

const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: corsOrigin,
  })
);

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes (prefix with /api)
app.use('/api/countries', countryRoutes);
app.use('/api/evaluate', evaluationRoutes);

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

module.exports = app;

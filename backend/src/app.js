require('dotenv').config();
const express = require('express');
const cors = require('cors');
const countryRoutes = require('./routes/countryRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const rulesRoutes = require('./routes/rulesRoutes');
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes (prefix with /api)
app.use('/api/countries', countryRoutes);
app.use('/api/evaluate', evaluationRoutes);
app.use('/api/rules', rulesRoutes);

// Static files and Client-side Routing (placed after API routes)
const path = require('path');
const publicPath = path.join(__dirname, '../public');

// Serve static files (always check this folder if it exists)
app.use(express.static(publicPath));

// Catch-all route to serve React's index.html for any non-API request
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

module.exports = app;

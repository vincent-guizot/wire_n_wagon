require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Root health check
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Wire & Wagon API - 1900s Logistics & Expedition Management System',
    status: 'Operational'
  });
});

// API Routes
app.use('/api', routes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    statusCode: 404,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[API Error]:', err);

  const statusCode = err.statusCode || (err.name === 'SequelizeValidationError' ? 400 : 500);
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Wire & Wagon API] Server running on port http://localhost:${PORT}`);
  });
}

module.exports = app;

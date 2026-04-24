const express = require('express');
const cors = require('cors');
const { requireAuth } = require('./middleware/authMiddleware');

const { globalLimiter } = require('./middleware/rateLimiter');

const app = express();

app.set('trust proxy', 1); // For Cloud Run / Load Balancers
app.use(globalLimiter);

// Safe CORS (avoid crash if env missing)
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health route (Public - for infra probes)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const mainRouter = require('./routes');
app.use('/api', mainRouter);

const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
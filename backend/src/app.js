const express = require('express');
const cors = require('cors');
const { requireAuth } = require('./middleware/authMiddleware');

const app = express();

// Safe CORS (avoid crash if env missing)
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health route (VERY IMPORTANT for Cloud Run)
app.get('/api/health', requireAuth, (req, res) => {
  res.send('Backend running');
});

const mainRouter = require('./routes');
app.use('/api', mainRouter);

const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
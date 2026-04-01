const express = require('express');
const cors = require('cors');

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
app.get('/api/health', (req, res) => {
  res.send('Backend running');
});

// ⚠️ Temporarily disable routes (they may crash)
try {
  const apiRoutes = require('./routes');
  app.use('/api', apiRoutes);
} catch (err) {
  console.log("Routes not loaded:", err.message);
}

// ⚠️ Disable error middleware temporarily
// const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
// app.use(notFoundHandler);
// app.use(errorHandler);

module.exports = app;
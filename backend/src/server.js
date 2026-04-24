const { env } = require('./config/env');
const http = require('http');
const app = require('./app');
const { logger } = require('./utils/logger');
const { initializeSocket } = require('./socket');

const port = process.env.PORT || 8080;
const server = http.createServer(app);

// START SERVER IMMEDIATELY (Crucial for Cloud Run)
server.listen(port, "0.0.0.0", () => {
  logger.info(`Collab Mind backend listening on port ${port}`, { 
    env: process.env.NODE_ENV || 'production',
    port: port 
  });
  
  // Initialize non-critical services after listening
  initializeSocket(server)
    .then(() => logger.info("Socket.io initialized successfully"))
    .catch(err => logger.error("Socket.io initialization failed", { error: err.message }));
});

// Basic error handling for the server
server.on('error', (error) => {
  logger.error("Server error", { error: error.message });
  process.exit(1);
});
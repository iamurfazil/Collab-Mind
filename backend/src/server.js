const { env } = require('./config/env'); // Load env vars first
const http = require('http');
const app = require('./app');
const { logger } = require('./utils/logger');
const { initializeSocket } = require('./socket');

const port = process.env.PORT || env.PORT || 5000;
const server = http.createServer(app);

async function bootstrap() {
  try {
    console.log("Starting server...");

    await initializeSocket(server);

    server.listen(port, "0.0.0.0", () => {
      logger.info(`Collab Mind backend running on port ${port}`);
    });

  } catch (error) {
    logger.error(error.message);
    process.exit(1);
    
  }
}

bootstrap();
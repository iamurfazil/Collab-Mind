const app = require('./app');
const { env } = require('./config/env');
const { logger } = require('./utils/logger');

// Use Cloud Run PORT first, fallback to env or 5000
const port = process.env.PORT || env.PORT || 5000;

async function bootstrap() {
  try {
    console.log("Starting server...");

    // Temporarily disabled to avoid crash in Cloud Run
    // await connectDatabase();
    // initializeFirebase();

    // IMPORTANT: bind to 0.0.0.0 for Cloud Run
    app.listen(port, "0.0.0.0", () => {
      logger.info(`Collab Mind backend running on port ${port}`);
    });

  } catch (error) {
    logger.error(error.message);
    process.exit(1);
    
  }
}

bootstrap();
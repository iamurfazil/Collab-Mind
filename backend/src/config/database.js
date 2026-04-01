const { env } = require('./env');
const { logger } = require('../utils/logger');

async function connectDatabase() {
  if (env.DB_PROVIDER === 'firestore') {
    logger.info('Using Firestore as database provider');
    return;
  }

  if (env.DB_PROVIDER === 'mongo') {
    logger.info('Mongo provider selected. Add Mongo connection initialization here.');
    return;
  }

  logger.warn(`Unknown DB_PROVIDER value: ${env.DB_PROVIDER}`);
}

module.exports = { connectDatabase };

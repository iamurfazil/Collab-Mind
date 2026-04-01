const dotenv = require('dotenv');

dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || '*',
  DB_PROVIDER: process.env.DB_PROVIDER || 'firestore',
};

module.exports = { env };

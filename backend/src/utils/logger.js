const logger = {
  format: (level, message, meta = {}) => {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    });
  },
  info: (message, meta) => console.log(logger.format('INFO', message, meta)),
  warn: (message, meta) => console.warn(logger.format('WARN', message, meta)),
  error: (message, meta) => console.error(logger.format('ERROR', message, meta)),
};

module.exports = { logger };

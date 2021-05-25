const winston = require('winston');
const {
  combine, timestamp, colorize, printf,
} = winston.format;

let rootLogger;

/**
 * Get the root logger.
 */
const getLogger = () => {
  if (!rootLogger) {
    throw new Error('You must first initialize the logger');
  }

  return rootLogger;
};

/**
 * Get a child logger from the root logger.
 */
const getChildLogger = (name, meta = {}) => {
  const logger = getLogger();
  const previousName = logger.defaultMeta?.name;

  return logger.child({
    name: previousName ? `${previousName}.${name}` : name,
    previousName,
    ...meta,
  });
};

const theLogFormat = printf(({
  level, message, timestamp, name = 'server', ...rest
}) => {
  return `${timestamp} | ${name} | ${level} | ${message} | ${JSON.stringify(rest)}`;
});

/**
 * Initialize the root logger.
 *
 * @param {string} level - The log level.
 * @param {boolean} disabled - Disable all logging.
 * @param {object} defaultMeta - Default metadata to show.
 * @param {winston.transport[]} extraTransports - Extra transports to add besides console.
 */
const initializeLogging = (
  level,
  disabled = false,
  defaultMeta = {},
  extraTransports = [],
) => {
  rootLogger = winston.createLogger({
    level,
    format: combine(
      colorize(), timestamp(), theLogFormat,
    ),
    defaultMeta,
    transports: [
      new winston.transports.Console({
        silent: disabled,
      }),
      ...extraTransports,
    ],
  });

  return rootLogger;
};

module.exports = {
  initializeLogging,
  getChildLogger,
  getLogger,
};

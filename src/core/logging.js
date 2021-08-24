const winston = require('winston');
const {
  combine, timestamp, colorize, printf, json,
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

const devFormat = () => {
  const formatMessage = ({
    level, message, timestamp, name = 'server', ...rest
  }) => `${timestamp} | ${name} | ${level} | ${message} | ${JSON.stringify(rest)}`;

  const formatError = ({
    error: { stack }, ...rest
  }) => `${formatMessage(rest)}\n\n${stack}\n`;
  const format = (info) => info.error instanceof Error ? formatError(info) : formatMessage(info);
  return combine(
    colorize(), timestamp(), printf(format),
  );
};

const prodFormat = () => {
  const replaceError = ({ label, level, message, stack }) => ({ label, level, message, stack });
  const replacer = (key, value) => value instanceof Error ? replaceError(value) : value;
  return json({ replacer });
};

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
    format: process.env.NODE_ENV === 'production' ? prodFormat() : devFormat(),
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

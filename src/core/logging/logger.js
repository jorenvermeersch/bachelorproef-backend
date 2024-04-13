const config = require('config');
const winston = require('winston');

const { consoleFormat, fileFormat } = require('./formats');

const NODE_ENV = config.get('env');

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
 * Initialize the root logger.
 *
 * @param {string} level - The log level.
 * @param {boolean} disabled - Disable all logging.
 * @param {object} defaultMeta - Default metadata to show.
 */
const initializeLogging = (level, disabled = false, defaultMeta = {}) => {
  const transports =
    NODE_ENV === 'testing'
      ? [
          new winston.transports.File({
            filename: 'test.log',
            format: fileFormat(),
            silent: disabled,
          }),
        ]
      : [
          new winston.transports.Console({
            format: consoleFormat(),
            silent: disabled,
          }),
          new winston.transports.File({
            filename: 'security.log',
            format: fileFormat(),
            silent: disabled,
            level: 'info',
          }),
        ];

  rootLogger = winston.createLogger({
    level,
    defaultMeta,
    transports,
  });

  return rootLogger;
};

module.exports = {
  initializeLogging,
  getLogger,
};

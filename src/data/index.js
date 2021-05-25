const config = require('config');
const knex = require('knex');

const { getChildLogger } = require('../core/logging');

const NODE_ENV = config.get('env');
const DATABASE_CLIENT = config.get('database.client');
const DATABASE_NAME = config.get('database.name');
const DATABASE_HOST = config.get('database.host');
const DATABASE_PORT = config.get('database.port');
const DATABASE_USERNAME = config.get('database.username');
const DATABASE_PASSWORD = config.get('database.password');

let knexInstance;

const getKnexLogger = (logger, level) => (message) => {
  if (message.sql) {
    logger.log(level, message.sql);
  } else if (message.length && message.forEach) {
    message.forEach((innerMessage) =>
      logger.log(level, innerMessage.sql ? innerMessage.sql : JSON.stringify(innerMessage)));
  } else {
    logger.log(level, JSON.stringify(message));
  }
};

async function initializeData() {
  const logger = getChildLogger('database');
  logger.info('Initializing connection to the database');

  knexInstance = knex({
    client: DATABASE_CLIENT,
    connection: {
      host: DATABASE_HOST,
      port: DATABASE_PORT,
      user: DATABASE_USERNAME,
      password: DATABASE_PASSWORD,
      database: DATABASE_NAME,
      insecureAuth: NODE_ENV === 'development',
    },
    debug: NODE_ENV === 'development',
    log: {
      debug: getKnexLogger(logger, 'debug'),
      error: getKnexLogger(logger, 'error'),
      warn: getKnexLogger(logger, 'warn'),
      deprecate: (method, alternative) => logger.warn('Knex reported something deprecated', {
        method,
        alternative,
      }),
    },
  });

  // Check the connection
  await knexInstance.raw('SELECT 1+1 AS result');

  logger.info('Succesfully connected to the database');

  return knexInstance;
}

async function shutdownData() {
  const logger = getChildLogger('database');

  logger.info('Shutting down database connection');

  await knexInstance.destroy();
  knexInstance = null;

  logger.info('Database connection closed');
}

function getKnex() {
  if (!knexInstance) throw new Error('Please initialize the data layer before getting the Knex instance');
  return knexInstance;
}

module.exports = {
  getKnex,
  initializeData,
  shutdownData,
};

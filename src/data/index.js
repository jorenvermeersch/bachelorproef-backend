const config = require('config');
const knex = require('knex');
const { join } = require('path');

const { createRateLimiter } = require('./rateLimiter');
const { getLogger } = require('../core/logging');

const NODE_ENV = config.get('env');
const isDevelopment = NODE_ENV === 'development';

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
      logger.log(
        level,
        innerMessage.sql ? innerMessage.sql : JSON.stringify(innerMessage),
      ),
    );
  } else {
    logger.log(level, JSON.stringify(message));
  }
};

async function initializeData() {
  const logger = getLogger();
  logger.info('Initializing connection to the database');

  const knexOptions = {
    client: DATABASE_CLIENT,
    connection: {
      host: DATABASE_HOST,
      port: DATABASE_PORT,
      user: DATABASE_USERNAME,
      password: DATABASE_PASSWORD,
      insecureAuth: isDevelopment,
    },
    debug: isDevelopment,
    log: {
      debug: getKnexLogger(logger, 'debug'),
      error: getKnexLogger(logger, 'error'),
      warn: getKnexLogger(logger, 'warn'),
      deprecate: (method, alternative) =>
        logger.warn('Knex reported something deprecated', {
          method,
          alternative,
        }),
    },
    migrations: {
      tableName: 'knex_meta',
      directory: join('src', 'data', 'migrations'),
    },
    seeds: {
      directory: join('src', 'data', 'seeds'),
    },
  };

  knexInstance = knex(knexOptions);

  // Check the connection, create the database and then reconnect
  try {
    await knexInstance.raw('SELECT 1+1 AS result');
    await knexInstance.raw('CREATE DATABASE IF NOT EXISTS ??', DATABASE_NAME);

    // We need to update the Knex configuration and reconnect to use the created database by default
    // USE ... would not work because a pool of connections is used
    await knexInstance.destroy();

    knexOptions.connection.database = DATABASE_NAME;
    knexInstance = knex(knexOptions);
    await knexInstance.raw('SELECT 1+1 AS result');
  } catch (error) {
    logger.error(error.message, { error });
    throw new Error('Could not initialize the data layer');
  }

  // Run migrations
  try {
    await knexInstance.migrate.latest();
  } catch (error) {
    logger.error('Error while migrating the database', {
      error,
    });

    // No point in starting the server when migrations failed
    throw new Error('Migrations failed, check the logs');
  }

  // Run seeds in development and if no users exist
  const [nrOfUsers] = await getKnex()(tables.user).count();
  if (isDevelopment && nrOfUsers['count(*)'] === 0) {
    try {
      await knexInstance.seed.run();
    } catch (error) {
      logger.error('Error while seeding database', {
        error,
      });
    }
  }

  logger.info('Successfully connected to the database');

  createRateLimiter(knexInstance);

  logger.info('Successfully initialized rate limiter');

  return knexInstance;
}

async function shutdownData() {
  const logger = getLogger();

  logger.info('Shutting down database connection');

  await knexInstance.destroy();
  knexInstance = null;

  logger.info('Database connection closed');
}

function getKnex() {
  if (!knexInstance)
    throw new Error(
      'Please initialize the data layer before getting the Knex instance',
    );
  return knexInstance;
}

const tables = Object.freeze({
  transaction: 'transactions',
  userLockout: 'user_lockouts',
  user: 'users',
  place: 'places',
  passwordResetRequest: 'password_reset_requests',
});

module.exports = {
  tables,
  getKnex,
  initializeData,
  shutdownData,
};

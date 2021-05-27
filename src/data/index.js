const config = require('config');
const knex = require('knex');
const { join } = require('path');
const { serializeError } = require('serialize-error');

const { getChildLogger } = require('../core/logging');

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
      insecureAuth: isDevelopment,
    },
    debug: isDevelopment,
    log: {
      debug: getKnexLogger(logger, 'debug'),
      error: getKnexLogger(logger, 'error'),
      warn: getKnexLogger(logger, 'warn'),
      deprecate: (method, alternative) => logger.warn('Knex reported something deprecated', {
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
  });

  // Check the connection
  await knexInstance.raw('SELECT 1+1 AS result');

  // Run migrations
  let migrationsFailed = true;
  try {
    await knexInstance.migrate.latest();
    migrationsFailed = false;
  } catch (error) {
    logger.error('Error while migrating the database', {
      error: serializeError(error),
    });
  }

  // Undo last migration if something failed
  if (migrationsFailed) {
    try {
      await knexInstance.migrate.down();
    } catch (error) {
      logger.error('Error while undoing last migration', {
        error: serializeError(error),
      });
    }
  }

  // Run seeds in development
  if (!migrationsFailed && isDevelopment) {
    // if no users exist, run the seed
    const nrOfUsers = await getKnex()(tables.user).count();

    if (nrOfUsers === 0) {
      try {
        await knexInstance.seed.run();
      } catch (error) {
        logger.error('Error while seeding database', {
          error: serializeError(error),
        });
      }
    }
  }

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

const tables = {
  transaction: 'transactions',
  user: 'users',
  place: 'places',
};

module.exports = {
  tables,
  getKnex,
  initializeData,
  shutdownData,
};

const config = require('config');
const { RateLimiterMySQL } = require('rate-limiter-flexible');

const { getKnex } = require('.');
const { getLogger } = require('../core/logging');

const NODE_ENV = config.get('env');

/**
 * Create the rate limiter instance for the application.
 *
 * @param {Object} knexInstance - Knex instance
 * @returns {Object} Rate limiter instance
 * @throws {Error} If error occurs while initializing rate limiter
 */
const createRateLimiter = (knexInstance) => {
  const options = {
    storeClient: knexInstance,
    storeType: 'knex',
    points: 4,
    duration: 1, // in seconds.
  };

  const ready = (error) => {
    if (!error) {
      return;
    }
    getLogger().error('Error while initializing rate limiter', { error });
    throw new Error('Could not initialize the rate limiter');
  };

  return new RateLimiterMySQL(options, ready);
};

/**
 * Middleware function for rate limiting.
 *
 * @returns {Function} Koa middleware function
 * @throws {Error} If rate limiter is not initialized
 */
const rateLimiter = () => {
  // Disable rate limiter in testing environment.
  if (NODE_ENV === 'testing') {
    return async (_, next) => {
      await next();
    };
  }

  const logger = getLogger();

  const rateLimiterInstance = createRateLimiter(getKnex());
  logger.info('Successfully initialized to the rate limiter');

  return async (ctx, next) => {
    try {
      await rateLimiterInstance.consume(ctx.ip);
      await next();
    } catch (error) {
      ctx.throw(429, 'Too many requests');
    }
  };
};

module.exports = { createRateLimiter, rateLimiter };

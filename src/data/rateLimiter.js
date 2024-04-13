const config = require('config');
const { RateLimiterMySQL } = require('rate-limiter-flexible');

const { getKnex } = require('.');
const {
  getLogger,
  getUserFromContext,
  rateLimitExceeded,
} = require('../core/logging');

const NODE_ENV = config.get('env');

/**
 * Create the rate limiter instance for the application.
 *
 * @param {Object} knexInstance - Knex instance
 * @returns {Object} Rate limiter instance
 * @throws {Error} If error occurs while initializing rate limiter
 */
const createRateLimiter = (knexInstance, options) => {
  const config = {
    storeClient: knexInstance,
    storeType: 'knex',
    ...options,
  };

  const ready = (error) => {
    if (!error) {
      return;
    }
    getLogger().error('Error while initializing rate limiter', { error });
    throw new Error('Could not initialize the rate limiter');
  };

  return new RateLimiterMySQL(config, ready);
};

/**
 * Middleware function for rate limiting.
 *
 * @returns {Function} Koa middleware function
 * @throws {Error} One of:
 *  - 429: Too many requests
 *  - Could not initialize the rate limiter
 */
const rateLimiter = (options) => {
  // Disable rate limiter in testing environment.
  if (NODE_ENV === 'testing') {
    return async (_, next) => {
      await next();
    };
  }

  const rateLimiterInstance = createRateLimiter(getKnex(), options);
  getLogger().info('Successfully initialized the rate limiter');

  return async (ctx, next) => {
    try {
      await rateLimiterInstance.consume(ctx.ip);
      await next();
    } catch (error) {
      const { userId, userString } = getUserFromContext(ctx);
      const { points } = options;
      ctx.throw(429, 'Too many requests', {
        logInfo: {
          event: rateLimitExceeded(userId, points),
          description: `${userString} exceeded the max:${points} requests per second`,
        },
      });
    }
  };
};

module.exports = { createRateLimiter, rateLimiter };

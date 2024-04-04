const { RateLimiterMySQL } = require('rate-limiter-flexible');

const { getLogger } = require('../core/logging');

let rateLimiterInstance;

const createRateLimiter = (knexInstance) => {
  const options = {
    storeClient: knexInstance,
    storeType: 'knex',
  };

  const ready = (error) => {
    if (!error) {
      return;
    }
    getLogger().error('Error while initializing rate limiter', { error });
    throw new Error('Could not initialize the rate limiter');
  };

  rateLimiterInstance = new RateLimiterMySQL(options, ready);

  return rateLimiterInstance;
};

const rateLimiter = () => {
  if (!rateLimiterInstance) {
    throw new Error('Rate limiter not initialized');
  }

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

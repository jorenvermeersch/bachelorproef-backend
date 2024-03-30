const config = require('config');

/**
 * Returns a middleware which waites for a certain amount of time
 * before calling the `next` function in order to make
 * time attacks very hard.
 *
 * @param {number} minDelay - The minimum delay in milliseconds.
 * @param {number} maxDelay - The maximum delay in milliseconds.
 *
 * @returns {Function} A Koa middleware.
 */
const delay =
  (minDelay = 0, maxDelay) =>
  async (_, next) => {
    await new Promise((resolve) => {
      const delay = minDelay + Math.round(Math.random() * maxDelay);
      setTimeout(resolve, delay);
    });
    return next();
  };

const AUTH_MAX_DELAY = config.get('auth.maxDelay');
const authDelay = delay(0, AUTH_MAX_DELAY);

module.exports = { delay, authDelay };

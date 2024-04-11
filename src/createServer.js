const config = require('config');
const Koa = require('koa');

const installMiddlewares = require('./core/installMiddlewares');
const { initializeLogging } = require('./core/logging/logger');
const { initializeData, shutdownData } = require('./data');
const installRouter = require('./rest');

const NODE_ENV = config.get('env');
const PROTOCOL = config.get('protocol');
const HOST = config.get('host');
const PORT = config.get('port');
const LOG_LEVEL = config.get('log.level');
const LOG_DISABLED = config.get('log.disabled');

/**
 * Creates a new server, does NOT start listening.
 */
module.exports = async function createServer() {
  const app = new Koa();

  const logger = initializeLogging(LOG_LEVEL, LOG_DISABLED, { NODE_ENV });

  await initializeData();
  installMiddlewares(app);
  installRouter(app);

  return {
    getApp() {
      return app;
    },

    start() {
      return new Promise((resolve) => {
        app.listen(PORT, () => {
          logger.info(`🚀 Server listening on ${PROTOCOL}://${HOST}:${PORT}`);
          resolve();
        });
      });
    },

    async stop() {
      app.removeAllListeners();
      await shutdownData();
      logger.info('Goodbye! 👋');
    },
  };
};

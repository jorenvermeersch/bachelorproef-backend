const Koa = require("koa");

const installMiddlewares = require("./core/installMiddlewares");
const { initializeLogging } = require("./core/logging");
const { initializeData, shutdownData } = require("./data");
const installRouter = require("./rest");

const NODE_ENV = process.env.NODE_ENV;
const PROTOCOL = process.env.PROTOCOL;
const HOST = process.env.HOST;
const PORT = process.env.PORT;
const LOG_LEVEL = process.env.LOG_LEVEL;
const LOG_DISABLED = process.env.LOG_DISABLED;

/**
 * Creates a new server, does NOT start listening.
 */
module.exports = async function createServer() {
  const app = new Koa();
  console.log(`${LOG_LEVEL} ${LOG_DISABLED}`);

  const logger = initializeLogging(LOG_LEVEL, LOG_DISABLED, { NODE_ENV });

  installMiddlewares(app);

  await initializeData();
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
      logger.info("Goodbye! 👋");
    },
  };
};

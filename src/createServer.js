const config = require('config');
const Koa = require('koa');

const HOST = config.get('host');
const PORT = config.get('port');

/**
 * Creates a new server, does NOT start listening.
 */
module.exports = async function createServer() {
  const app = new Koa();

  app.use(async (ctx) => {
    ctx.body = 'Hello world!';
  });

  return {
    start() {
      return new Promise((resolve) => {
        app.listen(PORT, () => {
          console.log(`🚀 Server listening on ${HOST}:${PORT}`);
          resolve();
        });
      });
    },

    stop() {
      app.removeAllListeners();
      console.log('Goodbye! 👋');
    },
  };
};


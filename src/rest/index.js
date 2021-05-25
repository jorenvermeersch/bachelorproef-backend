const Router = require('@koa/router');
const installTransactionRoutes = require('./transaction');

/**
 * Install all routes in the given Koa application.
 *
 * @param {Koa} app - The Koa application.
 */
module.exports = function installRoutes(app) {
  const router = new Router({
    prefix: '/api',
  });

  installTransactionRoutes(router);

  app
    .use(router.routes())
    .use(router.allowedMethods());
};

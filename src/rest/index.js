const Router = require('@koa/router');
const installTransactionRoutes = require('./transaction');
const installPlacesRoutes = require('./place');
const installUsersRoutes = require('./user');

/**
 * Install all routes in the given Koa application.
 *
 * @param {Koa} app - The Koa application.
 */
module.exports = function installRoutes(app) {
  const router = new Router({
    prefix: '/api',
  });

  installPlacesRoutes(router);
  installTransactionRoutes(router);
  installUsersRoutes(router);

  app
    .use(router.routes())
    .use(router.allowedMethods());
};

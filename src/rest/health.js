const Router = require('@koa/router');

const packageJson = require('../../package.json');
const { validate, validationSchemeFactory } = require('./_validation');

const ping = async (ctx) => {
  ctx.sendResponse(200, {
    pong: true,
  });
};
ping.validationScheme = validationSchemeFactory(null);

const getVersion = async (ctx) => {
  ctx.sendResponse(200, {
    env: process.env.NODE_ENV,
    version: packageJson.version,
    name: packageJson.name,
  });
};
getVersion.validationScheme = validationSchemeFactory(null);

/**
 * Install health routes in the given router.
 *
 * @param {Router} app - The parent router.
 */
module.exports = function installPlacesRoutes(app) {
  const router = new Router({
    prefix: '/health',
  });

  router.get('/ping', validate(ping.validationScheme), ping);
  router.get('/version', validate(getVersion.validationScheme), getVersion);

  app
    .use(router.routes())
    .use(router.allowedMethods());
};

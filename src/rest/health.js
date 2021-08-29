const Router = require('@koa/router');
const { validate, validationSchemeFactory } = require('./_validation');
const { healthService } = require('../service');

/**
 * @swagger
 * /api/health/ping:
 *   get:
 *     summary: Ping the server
 *     tags:
 *      - Health
 *     responses:
 *       200:
 *         description: Server pongs back
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - pong
 *               properties:
 *                 pong:
 *                   type: boolean
 */
const ping = async (ctx) => {
  ctx.sendResponse(200, healthService.ping());
};
ping.validationScheme = validationSchemeFactory(null);

/**
 * @swagger
 * /api/health/version:
 *   get:
 *     summary: Get the server's version information
 *     tags:
 *      - Health
 *     responses:
 *       200:
 *         description: The server's running version information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - env
 *                 - version
 *                 - name
 *               properties:
 *                 env:
 *                   type: string
 *                 version:
 *                   type: string
 *                 name:
 *                   type: string
 */
const getVersion = async (ctx) => {
  ctx.sendResponse(200, healthService.getVersion());
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

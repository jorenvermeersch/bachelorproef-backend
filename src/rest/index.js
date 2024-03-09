const Router = require('@koa/router');

const installHealthRoutes = require('./health');
const installPlacesRoutes = require('./place');
const installTransactionRoutes = require('./transaction');
const installUsersRoutes = require('./user');
const installPasswordRoutes = require('./password');

/**
 * @swagger
 * components:
 *   schemas:
 *     Base:
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: integer
 *           format: "int32"
 *       example:
 *         id: 123
 *     ListResponse:
 *       required:
 *         - count
 *       properties:
 *         count:
 *           type: integer
 *           description: Number of items returned
 *           example: 1
 */

/**
 * @swagger
 * components:
 *   parameters:
 *     idParam:
 *       in: path
 *       name: id
 *       description: Id of the item to fetch/update/delete
 *       required: true
 *       schema:
 *         type: integer
 *         format: "int32"
 */

/**
 * @swagger
 * components:
 *   responses:
 *     404NotFound:
 *       description: The request resource could not be found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - details
 *             properties:
 *               code:
 *                 type: string
 *               details:
 *                 type: string
 *                 description: Extra information about the specific not found error that occured
 *               stack:
 *                 type: string
 *                 description: Stack trace (only available if set in configuration)
 *             example:
 *               code: "NOT_FOUND"
 *               details: "No user with the id 123 exists"
 */

/**
 * @swagger
 * components:
 *   responses:
 *     400BadRequest:
 *       description: You provided invalid data
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - details
 *             properties:
 *               code:
 *                 type: string
 *               details:
 *                 type: string
 *                 description: Extra information about the specific bad request error that occured
 *               stack:
 *                 type: string
 *                 description: Stack trace (only available if set in configuration)
 *             example:
 *               code: "VALIDATION_FAILED"
 *               details: "You can only choose a rating between 1 and 5"
 */

/**
 * @swagger
 * components:
 *   responses:
 *     403Forbidden:
 *       description: You don't have access to this resource
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - details
 *             properties:
 *               code:
 *                 type: string
 *               details:
 *                 type: string
 *                 description: Extra information about the specific forbidden error that occured
 *               stack:
 *                 type: string
 *                 description: Stack trace (only available if set in configuration)
 *             example:
 *               code: "FORBIDDEN"
 *               details: "You are not allowed to view this user's information"
 */

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
  installHealthRoutes(router);
  installPasswordRoutes(router);

  app.use(router.routes()).use(router.allowedMethods());
};

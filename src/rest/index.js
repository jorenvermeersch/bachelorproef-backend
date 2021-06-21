const Router = require('@koa/router');
const installTransactionRoutes = require('./transaction');
const installPlacesRoutes = require('./place');
const installUsersRoutes = require('./user');

/**
 * @swagger
 * components:
 *   schemas:
 *     Base:
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           format: "uuid"
 *       example:
 *         id: "6d560fca-e7f9-4583-af2d-b05ccd1a0c58"
 *     ListResponse:
 *       required:
 *         - totalCount
 *         - count
 *         - limit
 *         - offset
 *       properties:
 *         totalCount:
 *           type: integer
 *           description: Total number of items in the database
 *         count:
 *           type: integer
 *           description: Number of items returned
 *         limit:
 *           type: integer
 *           description: Limit actually used
 *         offset:
 *           type: integer
 *           description: Offset actually used
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
 *         type: string
 *         format: "uuid"
 *     limitParam:
 *       in: query
 *       name: limit
 *       description: Maximum amount of items to return
 *       required: false
 *       schema:
 *         type: integer
 *         default: 100
 *     offsetParam:
 *       in: query
 *       name: offset
 *       description: Number of items to skip
 *       required: false
 *       schema:
 *         type: integer
 *         default: 0
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
 *               details: "No user with the id 99dada36-de4a-42ba-b329-3b1d88778c72 exists"
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

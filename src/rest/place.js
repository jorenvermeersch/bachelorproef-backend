const Router = require('@koa/router');

const { requireAuthentication } = require('../core/auth');
const { placeService } = require('../service');

/**
 * @swagger
 * tags:
 *   name: Places
 *   description: Represents an income source or a expense item
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Place:
 *       allOf:
 *         - $ref: "#/components/schemas/Base"
 *         - type: object
 *           required:
 *             - id
 *             - name
 *             - rating
 *           properties:
 *             name:
 *               type: "string"
 *             rating:
 *               type: "integer"
 *               minimum: 1
 *               maximum: 5
 *           example:
 *             name: "Loon"
 *             rating: 5
 *     PlacesList:
 *       allOf:
 *         - $ref: "#/components/schemas/ListResponse"
 *         - type: object
 *           required:
 *             - data
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Place"
 */

/**
 * @swagger
 * /api/places:
 *   get:
 *     summary: Get all places (paginated)
 *     tags:
 *      - Places
 *     parameters:
 *       - $ref: "#/components/parameters/limitParam"
 *       - $ref: "#/components/parameters/offsetParam"
 *     responses:
 *       200:
 *         description: List of places
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: "#/components/schemas/PlacesList"
 */
const getAllPlaces = async (ctx) => {
  const places = await placeService.getAll(
    ctx.query.limit && Number(ctx.query.limit),
    ctx.query.offset && Number(ctx.query.offset),
  );
  ctx.sendResponse(200, places);
};

/**
 * @swagger
 * /api/places/{id}:
 *   get:
 *     summary: Get a single place
 *     tags:
 *      - Places
 *     parameters:
 *       - $ref: "#/components/parameters/idParam"
 *     responses:
 *       200:
 *         description: The requested place
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Place"
 *       404:
 *         description: No place with the given id could be found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/404NotFound'
 */
const getPlaceById = async (ctx) => {
  const place = await placeService.getById(ctx.params.id);
  ctx.sendResponse(200, place);
};

/**
 * @swagger
 * /api/places:
 *   post:
 *     summary: Create a new place
 *     tags:
 *      - Places
 *     requestBody:
 *       description: The place info to save
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: The created place
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Place"
 *       400:
 *         description: You provided invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/400BadRequest'
 */
const createPlace = async (ctx) => {
  const place = await placeService.create(ctx.request.body);
  ctx.sendResponse(201, place);
};

/**
 * @swagger
 * /api/places/{id}:
 *   patch:
 *     summary: Update an existing place
 *     tags:
 *      - Places
 *     parameters:
 *       - $ref: "#/components/parameters/idParam"
 *     requestBody:
 *       description: The place info to save, you can leave out unchanged properties
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated place
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Place"
 *       400:
 *         description: You provided invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/400BadRequest'
 *       404:
 *         description: No place with the given id could be found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/404NotFound'
 */
const updatePlace = async (ctx) => {
  const place = await placeService.updateById(ctx.params.id, ctx.request.body);
  ctx.sendResponse(200, place);
};

/**
 * @swagger
 * /api/places/{id}:
 *   delete:
 *     summary: Delete a place
 *     tags:
 *      - Places
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Id of the place to delete
 *         required: true
 *         schema:
 *           type: string
 *           format: "uuid"
 *     responses:
 *       204:
 *         description: No response, the delete was successful
 *       404:
 *         description: No places with the given id could be found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/404NotFound'
 */
const deletePlace = async (ctx) => {
  await placeService.deleteById(ctx.params.id);
  ctx.sendResponse(204);
};

/**
 * Install places routes in the given router.
 *
 * @param {Router} app - The parent router.
 */
module.exports = function installPlacesRoutes(app) {
  const router = new Router({
    prefix: '/places',
  });

  router.use(requireAuthentication);

  router.get('/', getAllPlaces);
  router.get('/:id', getPlaceById);
  router.post('/', createPlace);
  router.patch('/:id', updatePlace);
  router.delete('/:id', deletePlace);

  app
    .use(router.routes())
    .use(router.allowedMethods());
};

const Router = require('@koa/router');
const Joi = require('joi');

const { requireAuthentication } = require('../core/auth');
const validate = require('../core/validation');
const placeService = require('../service/place');

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
 *             $ref: "#/components/examples/Place"
 *     PlacesList:
 *       allOf:
 *         - $ref: "#/components/schemas/ListResponse"
 *         - type: object
 *           required:
 *             - items
 *           properties:
 *             items:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Place"
 *   examples:
 *     Place:
 *       id: 123
 *       name: Loon
 *       rating: 4
 *   requestBodies:
 *     Place:
 *       description: The place info to save
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *             required:
 *               - name
 */

/**
 * @swagger
 * /api/places:
 *   get:
 *     summary: Get all places
 *     tags:
 *      - Places
 *     responses:
 *       200:
 *         description: List of places
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PlacesList"
 */
const getAllPlaces = async (ctx) => {
  const places = await placeService.getAll();
  ctx.body = places;
};
getAllPlaces.validationScheme = null;

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
  ctx.body = place;
};
getPlaceById.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
};

/**
 * @swagger
 * /api/places:
 *   post:
 *     summary: Create a new place
 *     tags:
 *      - Places
 *     requestBody:
 *       $ref: "#/components/requestBodies/Place"
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
  ctx.status = 201;
  ctx.body = place;
};
createPlace.validationScheme = {
  body: {
    name: Joi.string().max(255),
    rating: Joi.number().integer().min(1).max(5).optional(),
  },
};

/**
 * @swagger
 * /api/places/{id}:
 *   put:
 *     summary: Update an existing place
 *     tags:
 *      - Places
 *     parameters:
 *       - $ref: "#/components/parameters/idParam"
 *     requestBody:
 *       $ref: "#/components/requestBodies/Place"
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
  ctx.body = place;
};
updatePlace.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
  body: {
    name: Joi.string().max(255),
    rating: Joi.number().integer().min(1).max(5),
  },
};

/**
 * @swagger
 * /api/places/{id}:
 *   delete:
 *     summary: Delete a place
 *     tags:
 *      - Places
 *     parameters:
 *       - $ref: "#/components/parameters/idParam"
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
  ctx.status = 204;
};
deletePlace.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
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

  router.get('/', validate(getAllPlaces.validationScheme), getAllPlaces);
  router.get('/:id', validate(getPlaceById.validationScheme), getPlaceById);
  router.post('/', validate(createPlace.validationScheme), createPlace);
  router.put('/:id', validate(updatePlace.validationScheme), updatePlace);
  router.delete('/:id', validate(deletePlace.validationScheme), deletePlace);

  app
    .use(router.routes())
    .use(router.allowedMethods());
};

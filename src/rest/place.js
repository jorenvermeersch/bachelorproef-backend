const Router = require('@koa/router');

const { placeService } = require('../service');

const getAllPlaces = async (ctx) => {
  const places = await placeService.getAll(
    ctx.query.limit && Number(ctx.query.limit),
    ctx.query.offset && Number(ctx.query.offset),
  );
  ctx.sendResponse(200, places);
};

const getPlaceById = async (ctx) => {
  const place = await placeService.getById(ctx.params.id);
  ctx.sendResponse(200, place);
};

const createPlace = async (ctx) => {
  const place = await placeService.create(ctx.request.body);
  ctx.sendResponse(201, place);
};

const updatePlace = async (ctx) => {
  const place = await placeService.updateById(ctx.params.id, ctx.request.body);
  ctx.sendResponse(200, place);
};

const deletePlace = async (ctx) => {
  await placeService.deleteById(ctx.params.id);
  ctx.sendResponse(204);
};

/**
 * Install transaction routes in the given router.
 *
 * @param {Router} app - The parent router.
 */
module.exports = function installPlacesRoutes(app) {
  const router = new Router({
    prefix: '/places',
  });

  router.get('/', getAllPlaces);
  router.get('/:id', getPlaceById);
  router.post('/', createPlace);
  router.patch('/:id', updatePlace);
  router.delete('/:id', deletePlace);

  app
    .use(router.routes())
    .use(router.allowedMethods());
};

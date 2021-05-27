const Router = require('@koa/router');

const { placeService } = require('../service');

const getAllPlaces = async (ctx) => {
  const places = await placeService.getAll(
    ctx.query.limit && Number(ctx.query.limit),
    ctx.query.offset && Number(ctx.query.offset),
  );
  ctx.sendResponse(200, places);
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

  app
    .use(router.routes())
    .use(router.allowedMethods());
};

const Router = require('@koa/router');
const Joi = require('joi');

const {
  validate,
  schemas: { passwordSchema },
} = require('../core/validation');
const passwordService = require('../service/password');

// TODO: Add swagger documentation.
const requestReset = async (ctx) => {
  await passwordService.requestReset(
    ctx.request.body.email,
    ctx.request.headers.origin,
  );
  ctx.status = 202; 
};
requestReset.validationScheme = {
  body: {
    email: Joi.string().email(),
  },
};

// TODO: Add swagger documentation.
const reset = async (ctx) => {
  await passwordService.reset(ctx.request.body);
  ctx.status = 200;
};
reset.validationScheme = {
  body: {
    email: Joi.string().email(),
    newPassword: passwordSchema,
    token: Joi.string().uuid({ version: 'uuidv4' }),
  },
};

/**
 * Install transaction routes in the given router.
 *
 * @param {Router} app - The parent router.
 */
module.exports = function installPasswordRoutes(app) {
  const router = new Router({
    prefix: '/password',
  });

  router.post(
    '/request-reset',
    validate(requestReset.validationScheme),
    requestReset,
  );
  router.post('/reset', validate(reset.validationScheme), reset);

  app.use(router.routes()).use(router.allowedMethods());
};

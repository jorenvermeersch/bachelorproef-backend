const Router = require('@koa/router');
const config = require('config');
const Joi = require('joi');

const { delay } = require('../core/delay');
const {
  validate,
  validateAsync,
  schemas: { passwordSchemaAsync },
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
    newPassword: passwordSchemaAsync,
    token: Joi.string().uuid({ version: 'uuidv4' }),
  },
};

const MAX_MAIL_DELAY = config.get('mail.maxDelay');
const mailDelay = delay(0, MAX_MAIL_DELAY);

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
    mailDelay,
    validate(requestReset.validationScheme),
    requestReset,
  );
  router.post(
    '/reset',
    mailDelay,
    validateAsync(reset.validationScheme),
    reset,
  );

  app.use(router.routes()).use(router.allowedMethods());
};

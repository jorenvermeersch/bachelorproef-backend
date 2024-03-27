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

/**
 * @swagger
 * components:
 *   schemas:
 *     PasswordResetRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: 'string'
 *           format: email
 *     PasswordReset:
 *       type: object
 *       required:
 *         - email
 *         - newPassword
 *         - token
 *       properties:
 *         email:
 *           type: 'string'
 *           format: email
 *         newPassword:
 *           type: 'string'
 *           minLength: 12
 *           maxLength: 128
 *         token:
 *           type: 'string'
 *           format: uuid
 *   requestBodies:
 *     PasswordResetRequest:
 *       description: E-mail address of the account for which a password reset is requested.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasswordResetRequest'
 *           example:
 *             email: 'joren.vermeersch@student.hogent.be'
 *     PasswordReset:
 *       description: The information required to reset a password.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasswordReset'
 *           example:
 *             email: 'joren.vermeersch@student.hogent.be'
 *             newPassword: 'toegep@ste_informat1ca!'
 *             token: '52ab2f73-d4b5-449d-a906-0e2cbcde72a7'

 */

/**
 * @swagger
 * /api/password/request-reset:
 *   post:
 *     summary: Request a password reset
 *     tags:
 *       - Password
 *     requestBody:
 *       $ref: '#/components/requestBodies/PasswordResetRequest'
 *     responses:
 *       202:
 *         description: Request received. A reset link will be sent to the provided e-mail address if it's associated with an account.
 */
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

/**
 * @swagger
 * /api/password/reset:
 *   post:
 *     summary: Reset a password
 *     tags:
 *       - Password
 *     requestBody:
 *       $ref: '#/components/requestBodies/PasswordReset'
 *     responses:
 *       204:
 *         description: Password reset successfully.
 *       400:
 *         description: You provided invalid data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/400BadRequest'
 */
const reset = async (ctx) => {
  await passwordService.reset(ctx.request.body);
  ctx.status = 204;
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

const Router = require('@koa/router');
const config = require('config');
const Joi = require('joi');

const { requireAuthentication, makeRequireRole } = require('../core/auth');
const Role = require('../core/roles');
const validate = require('../core/validation');
const userService = require('../service/user');

const AUTH_DISABLED = config.get('auth.disabled');
const AUTH_MAX_DELAY = config.get('auth.maxDelay');

/**
 * Middleware which waites for a certain amount of time
 * before calling the `next` function in order to make
 * time attacks very hard.
 */
const authDelay = async (_, next) => {
  await new Promise((resolve) => {
    const delay = Math.round(Math.random() * AUTH_MAX_DELAY);
    setTimeout(resolve, delay);
  });
  return next();
};

/**
 * Check if the signed in user can access the given user's information.
 */
const checkUserId = (ctx, next) => {
  const { userId, roles } = ctx.state.session;
  const { id } = ctx.params;

  // You can only get our own data unless you're an admin
  if (id !== userId && !roles.includes(Role.ADMIN)) {
    return ctx.throw(403, 'You are not allowed to view this user\'s information', {
      code: 'FORBIDDEN',
    });
  }
  return next();
};

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Represents a user in the system
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       allOf:
 *         - $ref: "#/components/schemas/Base"
 *         - type: object
 *           required:
 *             - name
 *             - email
 *           properties:
 *             name:
 *               type: "string"
 *             email:
 *               type: "string"
 *               format: email
 *           example:
 *             $ref: "#/components/examples/User"
 *     UsersList:
 *       allOf:
 *         - $ref: "#/components/schemas/ListResponse"
 *         - type: object
 *           required:
 *             - items
 *           properties:
 *             items:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/User"
 *   examples:
 *     User:
 *       id: 123
 *       name: "Thomas Aelbecht"
 *       email: "thomas.aelbrecht@hogent.be"
 */

/**
 * @swagger
 * components:
 *   responses:
 *     LoginResponse:
 *       description: The user and a JWT
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 $ref: "#/components/schemas/User"
 *               token:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c..."
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags:
 *      - Users
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UsersList"
 */
const getAllUsers = async (ctx) => {
  const users = await userService.getAll();
  ctx.body = users;
};
getAllUsers.validationScheme = null;

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Try to login
 *     tags:
 *      - Users
 *     requestBody:
 *       description: The credentials of the user to login
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: The user and a JWT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/LoginResponse'
 *       400:
 *         description: You provided invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/400BadRequest'
 *       401:
 *         description: You provided invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - code
 *                 - details
 *               properties:
 *                 code:
 *                   type: string
 *                 details:
 *                   type: string
 *                   description: Extra information about the specific error that occured
 *                 stack:
 *                   type: string
 *                   description: Stack trace (only available if set in configuration)
 *               example:
 *                 code: "UNAUTHORIZED"
 *                 details: "The given email and password do not match"
 */
const login = async (ctx) => {
  const { email, password } = ctx.request.body;
  const token = await userService.login(email, password);
  ctx.status = 200;
  ctx.body = token;
};
login.validationScheme = {
  body: {
    email: Joi.string().email(),
    password: Joi.string(),
  },
};

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *      - Users
 *     requestBody:
 *       description: The user's data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: The user and a JWT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/LoginResponse'
 *       400:
 *         description: You provided invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/400BadRequest'
 */
const register = async (ctx) => {
  const token = await userService.register(ctx.request.body);
  ctx.status = 200;
  ctx.body = token;
};
register.validationScheme = {
  body: {
    name: Joi.string().max(255),
    email: Joi.string().email(),
    password: Joi.string().min(12).max(128),
  },
};

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a single user
 *     tags:
 *      - Users
 *     parameters:
 *       - $ref: "#/components/parameters/idParam"
 *     responses:
 *       200:
 *         description: The requested user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *       403:
 *         description: You can only request your own information unless you're an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/403Forbidden'
 *       404:
 *         description: No user with the given id could be found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/404NotFound'
 */
const getUserById = async (ctx) => {
  const user = await userService.getById(ctx.params.id);
  ctx.status = 200;
  ctx.body = user;
};
getUserById.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
};

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update an existing user
 *     tags:
 *      - Users
 *     parameters:
 *       - $ref: "#/components/parameters/idParam"
 *     responses:
 *       200:
 *         description: The updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *       403:
 *         description: You can only update your own information unless you're an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/403Forbidden'
 *       404:
 *         description: No user with the given id could be found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/404NotFound'
 */
const updateUserById = async (ctx) => {
  const user = await userService.updateById(ctx.params.id, ctx.request.body);
  ctx.status = 200;
  ctx.body = user;
};
updateUserById.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
  body: {
    name: Joi.string().max(255),
    email: Joi.string().email(),
  },
};

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags:
 *      - Users
 *     parameters:
 *       - $ref: "#/components/parameters/idParam"
 *     responses:
 *       204:
 *         description: No response, the delete was successful
 *       403:
 *         description: You can only update your own information unless you're an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/403Forbidden'
 *       404:
 *         description: No user with the given id could be found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/404NotFound'
 */
const deleteUserById = async (ctx) => {
  await userService.deleteById(ctx.params.id);
  ctx.status = 204;
};
deleteUserById.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
};

/**
 * Install transaction routes in the given router.
 *
 * @param {Router} app - The parent router.
 */
module.exports = function installUsersRoutes(app) {
  const router = new Router({
    prefix: '/users',
  });

  // Allow any user if authentication/authorization is disabled
  // DO NOT use this config parameter in any production worthy application!
  if (!AUTH_DISABLED) {
    // Public routes
    router.post('/login', authDelay, validate(login.validationScheme), login);
    router.post('/register', authDelay, validate(register.validationScheme), register);
  }

  const requireAdmin = makeRequireRole(Role.ADMIN);

  // Routes with authentication
  router.get('/', requireAuthentication, requireAdmin, validate(getAllUsers.validationScheme), getAllUsers);
  router.get('/:id', requireAuthentication, validate(getUserById.validationScheme), checkUserId, getUserById);
  router.put('/:id', requireAuthentication, validate(updateUserById.validationScheme), checkUserId, updateUserById);
  router.delete('/:id', requireAuthentication, validate(deleteUserById.validationScheme), checkUserId, deleteUserById);

  app
    .use(router.routes())
    .use(router.allowedMethods());
};

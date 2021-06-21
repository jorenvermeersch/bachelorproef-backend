const Router = require('@koa/router');
const { requireAuthentication } = require('../core/auth');
const { userService } = require('../service');

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
 *           properties:
 *             name:
 *               type: "string"
 *             email:
 *               type: "string"
 *               format: email
 *           example:
 *             name: "Thomas"
 *             email: "thomas.aelbrecht@hogent.be"
 *     UsersList:
 *       allOf:
 *         - $ref: "#/components/schemas/ListResponse"
 *         - type: object
 *           required:
 *             - data
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/User"
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
 *     summary: Get all users (paginated)
 *     tags:
 *      - Users
 *     parameters:
 *       - $ref: "#/components/parameters/limitParam"
 *       - $ref: "#/components/parameters/offsetParam"
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: "#/components/schemas/UsersList"
 */
const getAllUsers = async (ctx) => {
  const users = await userService.getAll(
    ctx.query.limit && Number(ctx.query.limit),
    ctx.query.offset && Number(ctx.query.offset),
  );
  ctx.sendResponse(200, users);
};

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
  ctx.sendResponse(200, token);
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
  ctx.sendResponse(200, token);
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
 *       404:
 *         description: No user with the given id could be found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/404NotFound'
 */
const getUserById = async (ctx) => {
  const { userId } = ctx.state.session;
  const { id } = ctx.params;

  // You can only get our own data
  if (id !== userId) {
    return ctx.throw(403, 'You are not allowed to view this user\'s information', {
      code: 'UNAUTHORIZED',
    });
  }

  const user = await userService.getById(id);
  ctx.sendResponse(200, user);
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

  // Public routes
  router.post('/login', login);
  router.post('/register', register);

  // Routes with authentication
  router.get('/', requireAuthentication, getAllUsers);
  router.get('/:id', requireAuthentication, getUserById);

  app
    .use(router.routes())
    .use(router.allowedMethods());
};

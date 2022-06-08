const Router = require('@koa/router');

const { requireAuthentication } = require('../core/auth');
const { transactionService } = require('../service');
const { validate, validationSchemeFactory } = require('./_validation');

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Represents a deposit of withdrawel of a user's budget
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       allOf:
 *         - $ref: "#/components/schemas/Base"
 *         - type: object
 *           required:
 *             - amount
 *             - date
 *             - user
 *             - place
 *           properties:
 *             name:
 *               type: "string"
 *             date:
 *               type: "string"
 *               format: date-time
 *             place:
 *               $ref: "#/components/schemas/Place"
 *             user:
 *               $ref: "#/components/schemas/User"
 *           example:
 *             $ref: "#/components/examples/Transaction"
 *     TransactionsList:
 *       allOf:
 *         - $ref: "#/components/schemas/ListResponse"
 *         - type: object
 *           required:
 *             - data
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Transaction"
 *   examples:
 *     Transaction:
 *       id: "7b25d1fc-a15c-49bd-8d3f-6365bfa1ca04"
 *       amount: 3000
 *       date: "2021-05-28T14:27:32.534Z"
 *       place:
 *         $ref: "#/components/examples/Place"
 *       user:
 *         $ref: "#/components/examples/User"
 *   requestBodies:
 *     Transaction:
 *       description: The transaction info to save.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: integer
 *                 example: 101
 *               date:
 *                 type: string
 *                 format: "date-time"
 *               placeId:
 *                 type: string
 *                 format: uuid
 */

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions
 *     tags:
 *      - Transactions
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/TransactionsList"
 */
const getAllTransactions = async (ctx) => {
  const { userId } = ctx.state.session;
  const transactions = await transactionService.getAll(userId);
  ctx.body = transactions;
};
getAllTransactions.validationScheme = validationSchemeFactory(null);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get a single transaction
 *     tags:
 *      - Transactions
 *     parameters:
 *       - $ref: "#/components/parameters/idParam"
 *     responses:
 *       200:
 *         description: The requested transaction
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Transaction"
 *       404:
 *         description: No transaction with the given id could be found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/404NotFound'
 */
const getTransactionById = async (ctx) => {
  const { userId } = ctx.state.session;
  const transaction = await transactionService.getById(ctx.params.id, userId);
  ctx.body = transaction;
};
getTransactionById.validationScheme = validationSchemeFactory((Joi) => ({
  params: {
    id: Joi.string().uuid(),
  },
}));

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     description: Creates a new transaction for the signed in user.
 *     tags:
 *      - Transactions
 *     requestBody:
 *       $ref: "#/components/requestBodies/Transaction"
 *     responses:
 *       200:
 *         description: The created transaction
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Transaction"
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
const createTransaction = async (ctx) => {
  const { userId } = ctx.state.session;
  const transaction = await transactionService.create({
    ...ctx.request.body,
    date: new Date(ctx.request.body.date),
    userId,
  });
  ctx.status = 201;
  ctx.body = transaction;
};
createTransaction.validationScheme = validationSchemeFactory((Joi) => ({
  body: {
    amount: Joi.number().invalid(0),
    date: Joi.date().iso().less('now'),
    placeId: Joi.string().uuid(),
  },
}));

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Update an existing transaction
 *     tags:
 *      - Transactions
 *     parameters:
 *       - $ref: "#/components/parameters/idParam"
 *     requestBody:
 *       $ref: "#/components/requestBodies/Transaction"
 *     responses:
 *       200:
 *         description: The updated transaction
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Transaction"
 *       400:
 *         description: You provided invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/400BadRequest'
 *       404:
 *         description: No transaction/place with the given id could be found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/404NotFound'
 */
const updateTransaction = async (ctx) => {
  const { userId } = ctx.state.session;
  const transaction = await transactionService.updateById(ctx.params.id, {
    ...ctx.request.body,
    date: ctx.request.body.date && new Date(ctx.request.body.date),
    userId,
  });
  ctx.status = 200;
  ctx.body = transaction;
};
updateTransaction.validationScheme = validationSchemeFactory((Joi) => ({
  params: {
    id: Joi.string().uuid(),
  },
  body: {
    amount: Joi.number().invalid(0),
    date: Joi.date().iso().less('now'),
    placeId: Joi.string().uuid(),
  },
}));

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     tags:
 *      - Transactions
 *     parameters:
 *       - $ref: "#/components/parameters/idParam"
 *     responses:
 *       204:
 *         description: No response, the delete was successful
 *       404:
 *         description: No transaction with the given id could be found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/404NotFound'
 */
const deleteTransaction = async (ctx) => {
  const { userId } = ctx.state.session;
  await transactionService.deleteById(ctx.params.id, userId);
  ctx.status = 204;
};
deleteTransaction.validationScheme = validationSchemeFactory((Joi) => ({
  params: {
    id: Joi.string().uuid(),
  },
}));

/**
 * Install transaction routes in the given router.
 *
 * @param {Router} app - The parent router.
 */
module.exports = function installTransactionRoutes(app) {
  const router = new Router({
    prefix: '/transactions',
  });

  router.use(requireAuthentication);

  router.get('/', validate(getAllTransactions.validationScheme), getAllTransactions);
  router.get('/:id', validate(getTransactionById.validationScheme), getTransactionById);
  router.post('/', validate(createTransaction.validationScheme), createTransaction);
  router.put('/:id', validate(updateTransaction.validationScheme), updateTransaction);
  router.delete('/:id', validate(deleteTransaction.validationScheme), deleteTransaction);

  app
    .use(router.routes())
    .use(router.allowedMethods());
};

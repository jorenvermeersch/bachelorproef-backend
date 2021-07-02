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
 *               type: "string"
 *             user:
 *               type: "string"
 *           example:
 *             amount: 3000
 *             date: "2021-05-28T14:27:32.534Z"
 *             place: "Loon"
 *             user: "Thomas"
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
 */

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions (paginated)
 *     tags:
 *      - Transactions
 *     parameters:
 *       - $ref: "#/components/parameters/limitParam"
 *       - $ref: "#/components/parameters/offsetParam"
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: "#/components/schemas/TransactionsList"
 */
const getAllTransactions = async (ctx) => {
  const { userId } = ctx.state.session;
  const transactions = await transactionService.getAll({
    userId,
    limit: ctx.query.limit && Number(ctx.query.limit),
    offset: ctx.query.offset && Number(ctx.query.offset),
  });
  ctx.sendResponse(200, transactions);
};
getAllTransactions.validationScheme = validationSchemeFactory((Joi) => ({
  query: Joi.object({
    limit: Joi.number().min(10).max(1000).optional(),
    offset: Joi.number().min(0).optional(),
  }).and('limit', 'offset'),
}));

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
  const transaction = await transactionService.getById(ctx.params.id);
  ctx.sendResponse(200, transaction);
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
 *     tags:
 *      - Transactions
 *     requestBody:
 *       description: The transaction info to save
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: "date-time"
 *               place:
 *                 type: string
 *                 description: "Name of the place the transaction is for, will create a new one if not existing"
 *               userId:
 *                 type: string
 *                 format: "uuid"
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
 */
const createTransaction = async (ctx) => {
  const transaction = await transactionService.create({
    ...ctx.request.body,
    date: new Date(ctx.request.body.date),
  });
  ctx.sendResponse(201, transaction);
};
createTransaction.validationScheme = validationSchemeFactory((Joi) => ({
  body: {
    amount: Joi.number(),
    date: Joi.date().iso().less('now'),
    place: Joi.string().max(255),
    userId: Joi.string().uuid(),
  },
}));

/**
 * @swagger
 * /api/transactions/{id}:
 *   patch:
 *     summary: Update an existing transaction
 *     tags:
 *      - Transactions
 *     parameters:
 *       - $ref: "#/components/parameters/idParam"
 *     requestBody:
 *       description: The transaction info to save, you can leave out unchanged properties
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: "date-time"
 *               place:
 *                 type: string
 *                 description: "Name of the place the transaction is for, will create a new one if not existing"
 *               userId:
 *                 type: string
 *                 format: "uuid"
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
 *         description: No transaction with the given id could be found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/404NotFound'
 */
const updateTransaction = async (ctx) => {
  const transaction = await transactionService.updateById(ctx.params.id, {
    ...ctx.request.body,
    date: ctx.request.body.date && new Date(ctx.request.body.date),
  });
  ctx.sendResponse(200, transaction);
};
updateTransaction.validationScheme = validationSchemeFactory((Joi) => ({
  params: {
    id: Joi.string().uuid(),
  },
  body: {
    amount: Joi.number(),
    date: Joi.date().iso().less('now'),
    place: Joi.string().max(255),
    userId: Joi.string().uuid(),
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
  await transactionService.deleteById(ctx.params.id);
  ctx.sendResponse(204);
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
  router.patch('/:id', validate(updateTransaction.validationScheme), updateTransaction);
  router.delete('/:id', validate(deleteTransaction.validationScheme), deleteTransaction);

  app
    .use(router.routes())
    .use(router.allowedMethods());
};

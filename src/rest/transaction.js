const Router = require('@koa/router');

const { transactionService } = require('../service');

const getAllTransactions = async (ctx) => {
  const transactions = await transactionService.getAll(
    ctx.query.limit && Number(ctx.query.limit),
    ctx.query.offset && Number(ctx.query.offset),
  );
  ctx.sendResponse(200, transactions);
};

const getTransactionById = async (ctx) => {
  const transaction = await transactionService.getById(ctx.params.id);
  ctx.sendResponse(200, transaction);
};

const createTransaction = async (ctx) => {
  const transaction = await transactionService.create({
    ...ctx.request.body,
    date: new Date(ctx.request.body.date),
  });
  ctx.sendResponse(201, transaction);
};

const updateTransaction = async (ctx) => {
  const transaction = await transactionService.updateById(ctx.params.id, {
    ...ctx.request.body,
    date: ctx.request.body.date && new Date(ctx.request.body.date),
  });
  ctx.sendResponse(200, transaction);
};

const deleteTransaction = async (ctx) => {
  await transactionService.deleteById(ctx.params.id);
  ctx.sendResponse(204);
};

/**
 * Install transaction routes in the given router.
 *
 * @param {Router} app - The parent router.
 */
module.exports = function installTransactionRoutes(app) {
  const router = new Router({
    prefix: '/transactions',
  });

  router.get('/', getAllTransactions);
  router.get('/:id', getTransactionById);
  router.post('/', createTransaction);
  router.patch('/:id', updateTransaction);
  router.delete('/:id', deleteTransaction);

  app
    .use(router.routes())
    .use(router.allowedMethods());
};

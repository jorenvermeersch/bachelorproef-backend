const Router = require('@koa/router');

const { transactionService } = require('../service');

const getAllTransactions = async (ctx) => {
  const transactions = await transactionService.getAll(10);
  ctx.sendResponse(200, {
    transactions,
  });
};

const createTransaction = async (ctx) => {
  const transaction = await transactionService.create({
    ...ctx.request.body,
    date: new Date(ctx.request.body.date),
  });
  ctx.sendResponse(201, transaction);
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
  router.post('/', createTransaction);

  app
    .use(router.routes())
    .use(router.allowedMethods());
};

const Router = require('@koa/router');

const { transactionRepository } = require('../repository');

const getAllTransactions = async (ctx) => {
  const transactions = await transactionRepository.getAll();
  ctx.sendResponse(200, {
    transactions,
  });
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

  app
    .use(router.routes())
    .use(router.allowedMethods());
};

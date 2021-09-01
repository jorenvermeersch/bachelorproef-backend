const { transactionService } = require('../../service');

// TODO: userId moet nog toegevoegd worden
const transactionResolvers = {
  Query: {
    transactions: (_, { offset, limit }, ctx) => {
      const { userId } = ctx.state.session;
      return transactionService.getAll({ userId, limit, offset });
    },
    transaction: (_, { id }, ctx) => {
      const { userId } = ctx.state.session;
      return transactionService.getById(id, userId);
    },
  },
  Mutation: {
    createTransaction: (_, { input }, ctx) => {
      const { userId } = ctx.state.session;
      return transactionService.create({ userId, ...input });
    },
    updateTransaction: (_, { id, input }, ctx) => {
      const { userId } = ctx.state.session;
      return transactionService.updateById(id, { userId, ...input });
    },
    deleteTransaction: async (_, { id }, ctx) => {
      const { userId } = ctx.state.session;
      await transactionService.deleteById(id, userId);
      return { success: true };
    },
  },
};

module.exports = transactionResolvers;

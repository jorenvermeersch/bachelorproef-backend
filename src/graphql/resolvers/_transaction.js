const { transactionService } = require('../../service');

// TODO: userId moet nog toegevoegd worden
const transactionResolvers = {
  Query: {
    transactions: (_, { offset, limit }) => transactionService.getAll({ limit, offset }),
    transaction: (_, { id }) => transactionService.getById(id),
  },
  Mutation: {
    createTransaction: (_, { input }) => transactionService.create(input),
    updateTransaction: (_, { id, input }) => transactionService.updateById(id, input),
    deleteTransaction: async (_, { id }) => {
      await transactionService.deleteById(id);
      return { success: true };
    },
  },
};

module.exports = transactionResolvers;

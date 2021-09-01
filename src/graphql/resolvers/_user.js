const config = require('config');
const { userService } = require('../../service');

const authMutations = config.get('auth.disabled') ? {} : {
  login: (_, { input: { email, password } }) => userService.login(email, password),
  register: (_, { input }) => userService.register(input),
};

const userResolvers = {
  Query: {
    users: (_, { offset, limit }) => userService.getAll(limit, offset),
    user: (_, { id }) => userService.getById(id),
  },
  Mutation: {
    ...authMutations,
    updateUser: (_, { id, input }) => userService.updateById(id, input),
    deleteUser: async (_, { id }) => {
      await userService.deleteById(id);
      return { success: true };
    },
  },
};

module.exports = userResolvers;

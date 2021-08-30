const { placeService } = require('../../service');

const placeResolvers = {
  Query: {
    places: (_, { offset, limit }) => placeService.getAll(limit, offset),
    place: (_, { id }) => placeService.getById(id),
  },
  Mutation: {
    createPlace: (_, { input }) => placeService.create(input),
    updatePlace: (_, { id, input }) => placeService.updateById(id, input),
    deletePlace: async (_, { id }) => {
      await placeService.deleteById(id);
      return { success: true };
    },
  },
};

module.exports = placeResolvers;

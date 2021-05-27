const { placeRepository } = require('../repository');

/**
 * Get all `limit` places, skip the first `offset`.
 *
 * @param {number} [limit] - Nr of places to fetch.
 * @param {number} [offset] - Nr of places to skip.
 */
const getAll = async (limit, offset) => {
  const data = await placeRepository.findAll({ limit, offset });
  const totalCount = await placeRepository.findCount();
  return {
    data,
    totalCount,
    count: data.length,
    limit,
    offset,
  };
};

/**
 * Get the first place with the given name, returns null if nothing matched.
 *
 * @param {string} name - The name to look for.
 */
const getByName = async (name) => {
  return await placeRepository.findByName(name);
};

/**
 * Get the first place with the given name, returns null if nothing matched.
 *
 * @param {object} place - Place to create.
 * @param {string} place.name - Name of the place.
 */
const create = async ({ name }) => {
  const id = await placeRepository.create({ name });
  return { id };
};

module.exports = {
  getAll,
  getByName,
  create,
};

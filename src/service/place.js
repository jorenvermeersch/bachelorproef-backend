const { placeRepository } = require('../repository');

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
  getByName,
  create,
};

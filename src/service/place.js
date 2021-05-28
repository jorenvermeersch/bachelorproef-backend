const ServiceError = require('../core/serviceError');
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
 * @param {number} [place.rating] - Rating of the place (between 1 and 5).
 */
const create = async ({ name, rating }) => {
  if (rating && (rating < 1 || rating > 5)) {
    throw ServiceError.validationFailed('Please provide a rating between 1 and 5');
  }

  const id = await placeRepository.create({ name, rating });
  return { id };
};

module.exports = {
  getAll,
  getByName,
  create,
};

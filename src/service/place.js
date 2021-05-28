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
 * Get the place with the given `id`.
 *
 * @param {string} id - Id of the place to get.
 *
 * @throws {ServiceError} One of:
 * - NOT_FOUND: No place with the given id could be found.
 */
const getById = async (id) => {
  const place = await placeRepository.findById(id);

  if (!place) {
    throw ServiceError.notFound(`No place with id ${id} exists`);
  }

  return place;
};

/**
 * Create a new place.
 *
 * @param {object} place - Place to create.
 * @param {string} place.name - Name of the place.
 * @param {number} [place.rating] - Rating of the place (between 1 and 5).
 */
const create = async ({ name, rating }) => {
  if (rating && (rating < 1 || rating > 5)) {
    throw ServiceError.validationFailed('Please provide a rating between 1 and 5');
  }

  const existingPlace = await getByName(name);

  if (existingPlace) {
    throw ServiceError.validationFailed(`A place with name ${name} already exists`);
  }

  const id = await placeRepository.create({ name, rating });
  return getById(id);
};

/**
 * Update an existing place.
 *
 * @param {string} id - Id of the place to update.
 * @param {object} place - Place to save.
 * @param {string} [place.name] - Name of the place.
 * @param {number} [place.rating] - Rating of the place (between 1 and 5).
 *
 * @throws {ServiceError} One of:
 * - NOT_FOUND: No place with the given id could be found.
 */
const updateById = async (id, { name, rating }) => {
  if (rating && (rating < 1 || rating > 5)) {
    throw ServiceError.validationFailed('Please provide a rating between 1 and 5');
  }

  const existingPlace = await getByName(name);

  if (existingPlace) {
    throw ServiceError.validationFailed(`A place with name ${name} already exists`);
  }

  await placeRepository.updateById(id, { name, rating });
  return getById(id);
};


/**
 * Delete an existing place.
 *
 * @param {string} id - Id of the place to delete.
 *
 * @throws {ServiceError} One of:
 * - NOT_FOUND: No place with the given id could be found.
 */
const deleteById = async (id) => {
  const deleted = await placeRepository.deleteById(id);

  if (!deleted) {
    throw ServiceError.notFound(`No place with id ${id} exists`);
  }
};

module.exports = {
  getAll,
  getByName,
  getById,
  create,
  updateById,
  deleteById,
};

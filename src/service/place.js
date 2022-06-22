const ServiceError = require('../core/serviceError');
const { placeRepository } = require('../repository');
const handleDBError = require('./_handleDBError');

/**
 * Get all places.
 */
const getAll = async () => {
  const items = await placeRepository.findAll();
  return {
    items,
    count: items.length,
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
 * @param {number} id - Id of the place to get.
 *
 * @throws {ServiceError} One of:
 * - NOT_FOUND: No place with the given id could be found.
 */
const getById = async (id) => {
  const place = await placeRepository.findById(id);

  if (!place) {
    throw ServiceError.notFound(`No place with id ${id} exists`, { id });
  }

  return place;
};

/**
 * Create a new place.
 *
 * @param {object} place - Place to create.
 * @param {string} place.name - Name of the place.
 * @param {number} [place.rating] - Rating of the place (between 1 and 5).
 *
 * @throws {ServiceError} One of:
 * - VALIDATION_FAILED: A place with the same name exists.
 */
const create = async ({ name, rating }) => {
  const id = await placeRepository.create({ name, rating }).catch(handleDBError);
  return getById(id);
};

/**
 * Update an existing place.
 *
 * @param {number} id - Id of the place to update.
 * @param {object} place - Place to save.
 * @param {string} [place.name] - Name of the place.
 * @param {number} [place.rating] - Rating of the place (between 1 and 5).
 *
 * @throws {ServiceError} One of:
 * - NOT_FOUND: No place with the given id could be found.
 * - VALIDATION_FAILED: A place with the same name exists.
 */
const updateById = async (id, { name, rating }) => {
  await placeRepository.updateById(id, { name, rating }).catch(handleDBError);
  return getById(id);
};


/**
 * Delete an existing place.
 *
 * @param {number} id - Id of the place to delete.
 *
 * @throws {ServiceError} One of:
 * - NOT_FOUND: No place with the given id could be found.
 */
const deleteById = async (id) => {
  const deleted = await placeRepository.deleteById(id);

  if (!deleted) {
    throw ServiceError.notFound(`No place with id ${id} exists`, { id });
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

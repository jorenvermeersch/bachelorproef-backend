const config = require('config');
const {
  tables,
  getKnex,
} = require('../data/index');
const {
  serializeError,
} = require('serialize-error');
const {
  getChildLogger,
} = require('../core/logging');
const {
  getLastId,
} = require('./_repository.helpers');

const DEFAULT_PAGINATION_LIMIT = config.get('pagination.limit');
const DEFAULT_PAGINATION_OFFSET = config.get('pagination.offset');

/**
 * Find all `limit` places, skip the first `offset`.
 *
 * @param {object} [pagination] - Pagination options
 * @param {number} [pagination.limit] - Nr of places to return.
 * @param {number} [pagination.offset] - Nr of places to skip.
 */
const findAll = async ({
  limit = DEFAULT_PAGINATION_LIMIT,
  offset = DEFAULT_PAGINATION_OFFSET,
} = {}) => {
  try {
    return await getKnex()(tables.place)
      .select()
      .limit(limit)
      .offset(offset);
  } catch (error) {
    const logger = getChildLogger('places-repo');
    logger.error('Error in findAll', {
      error: serializeError(error),
    });
    throw error;
  }
};

/**
 * Find a place with the given `name`.
 *
 * @param {string} name - Name to look for.
 */
const findByName = async (name) => {
  try {
    return await getKnex()(tables.place)
      .where('name', name)
      .first();
  } catch (error) {
    const logger = getChildLogger('places-repo');
    logger.error('Error in create', {
      error: serializeError(error),
    });
    throw error;
  }
};

/**
 * Find a place with the given `id`.
 *
 * @param {string} id - Id of the place to find.
 */
const findById = async (id) => {
  try {
    return await getKnex()(tables.place)
      .where('id', id)
      .first();
  } catch (error) {
    const logger = getChildLogger('places-repo');
    logger.error('Error in findById', {
      error: serializeError(error),
    });
    throw error;
  }
};

/**
 * Calculate the total number of places.
 */
const findCount = async () => {
  try {
    const [count] = await getKnex()(tables.place)
      .count();
    return count['count(*)'];
  } catch (error) {
    const logger = getChildLogger('places-repo');
    logger.error('Error in findCount', {
      error: serializeError(error),
    });
    throw error;
  }
};

/**
 * Create a new place with the given `name` and `rating`.
 *
 * @param {object} place - Place to create.
 * @param {string} place.name - Name of the place.
 * @param {number} [place.rating] - Rating given to the place (1 to 5).
 *
 * @returns {Promise<string>} Created place's id
 */
const create = async ({
  name,
  rating,
}) => {
  try {
    await getKnex()(tables.place)
      .insert({
        name,
        rating,
      });

    return await getLastId();
  } catch (error) {
    const logger = getChildLogger('places-repo');
    logger.error('Error in create', {
      error: serializeError(error),
    });
    throw error;
  }
};

/**
 * Update an existing place with the given `name` and `rating`.
 *
 * @param {string} id - Id of the place to update.
 * @param {object} place - Place to create.
 * @param {string} [place.name] - Name of the place.
 * @param {number} [place.rating] - Rating given to the place (1 to 5).
 *
 * @returns {Promise<string>} Place's id
 */
const updateById = async (id, {
  name,
  rating,
}) => {
  try {
    await getKnex()(tables.place)
      .update({
        name,
        rating,
      })
      .where('id', id);

    return await getLastId();
  } catch (error) {
    const logger = getChildLogger('places-repo');
    logger.error('Error in updateById', {
      error: serializeError(error),
    });
    throw error;
  }
};

/**
 * Delete a place.
 *
 * @param {string} id - Id of the place to delete.
 *
 * @returns {Promise<boolean>} Whether the place was deleted.
 */
const deleteById = async (id) => {
  try {
    const rowsAffected = await getKnex()(tables.place)
      .delete()
      .where('id', id);

    return rowsAffected > 0;
  } catch (error) {
    const logger = getChildLogger('places-repo');
    logger.error('Error in deleteById', {
      error: serializeError(error),
    });
    throw error;
  }
};

module.exports = {
  findAll,
  findById,
  findCount,
  findByName,
  create,
  updateById,
  deleteById,
};

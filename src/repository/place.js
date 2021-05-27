const { tables, getKnex } = require('../data/index');
const { serializeError } = require('serialize-error');
const { getChildLogger } = require('../core/logging');
const { getLastId } = require('./_repository.helpers');

/**
 * Find a place with the given name.
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
 * Create a new place with the given `name`.
 */
const create = async ({ name }) => {
  try {
    await getKnex()(tables.place)
      .insert({ name });

    return await getLastId();
  } catch (error) {
    const logger = getChildLogger('places-repo');
    logger.error('Error in create', {
      error: serializeError(error),
    });
    throw error;
  }
};

module.exports = {
  findByName,
  create,
};

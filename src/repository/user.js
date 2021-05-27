const { tables, getKnex } = require('../data/index');
const { serializeError } = require('serialize-error');
const { getChildLogger } = require('../core/logging');
const { getLastId } = require('./_repository.helpers');

/**
 * Create a new user with the given `name`.
 */
const create = async ({ name }) => {
  try {
    await getKnex()(tables.user)
      .insert({ name });
    return await getLastId();
  } catch (error) {
    const logger = getChildLogger('users-repo');
    logger.error('Error in create', {
      error: serializeError(error),
    });
    throw error;
  }
};

module.exports = {
  create,
};

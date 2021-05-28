const config = require('config');
const { tables, getKnex } = require('../data/index');
const { serializeError } = require('serialize-error');
const { getChildLogger } = require('../core/logging');
const { getLastId } = require('./_repository.helpers');

const DEFAULT_PAGINATION_LIMIT = config.get('pagination.limit');
const DEFAULT_PAGINATION_OFFSET = config.get('pagination.offset');

/**
 * Get all `limit` users, skip the first `offset`.
 *
 * @param {object} [pagination] - Pagination options
 * @param {number} [pagination.limit] - Nr of transactions to return.
 * @param {number} [pagination.offset] - Nr of transactions to skip.
 */
const findAll = async ({
  limit = DEFAULT_PAGINATION_LIMIT,
  offset = DEFAULT_PAGINATION_OFFSET,
} = {}) => {
  try {
    return await getKnex()(tables.user)
      .select()
      .limit(limit)
      .offset(offset);
  } catch (error) {
    const logger = getChildLogger('users-repo');
    logger.error('Error in findAll', {
      error: serializeError(error),
    });
    throw error;
  }
};

/**
 * Calculate the total number of user.
 */
const findCount = async () => {
  try {
    const [count] = await getKnex()(tables.user)
      .count();
    return count['count(*)'];
  } catch (error) {
    const logger = getChildLogger('users-repo');
    logger.error('Error in findCount', {
      error: serializeError(error),
    });
    throw error;
  }
};

/**
 * Create a new user with the given `name`.
 *
 * @param {object} user - User to create.
 * @param {string} user.name - Name of the user.
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
  findAll,
  findCount,
  create,
};

const config = require('config');
const { tables, getKnex } = require('../data/index');
const { serializeError } = require('serialize-error');
const { getChildLogger } = require('../core/logging');
const { getLastId } = require('./_repository.helpers');

const DEFAULT_PAGINATION_LIMIT = config.get('pagination.limit');
const DEFAULT_PAGINATION_OFFSET = config.get('pagination.offset');

/**
 * Get all `limit` transactions, throws on error.
 *
 * @param {object} [pagination] - Pagination options
 * @param {number} [pagination.limit] - Nr of transactions to return.
 * @param {number} [pagination.offset] - Nr of transactions to skip.
 */
const findAll = async({
  limit = DEFAULT_PAGINATION_LIMIT,
  offset = DEFAULT_PAGINATION_OFFSET,
} = {}) => {
  try {
    return await getKnex()(tables.transaction)
      .select(
        `${tables.transaction}.id`, 'amount', 'date',
        `${tables.place}.name AS place`, `${tables.user}.name AS user`,
      )
      .join(tables.place, `${tables.transaction}.place_id`, '=', `${tables.place}.id`)
      .join(tables.user, `${tables.transaction}.user_id`, '=', `${tables.user}.id`)
      .limit(limit)
      .offset(offset);
  } catch (error) {
    const logger = getChildLogger('transactions-repo');
    logger.error('Error in getAll', {
      error: serializeError(error),
    });
    throw error;
  }
};

/**
 * Create a new transaction.
 *
 * @param {object} transaction - The transaction to create.
 * @param {string} transaction.amount - Amount deposited/withdrawn.
 * @param {Date} transaction.date - Date of the transaction.
 * @param {string} transaction.placeId - Id of the place the transaction happened.
 * @param {string} transaction.userId - Id of the user who did the transaction.
 */
const create = async ({
  amount,
  date,
  placeId,
  userId,
}) => {
  try {
    await getKnex()(tables.transaction)
      .insert({
        amount,
        date,
        place_id: placeId,
        user_id: userId,
      });
    return await getLastId();
  } catch (error) {
    const logger = getChildLogger('transactions-repo');
    logger.error('Error in create', {
      error: serializeError(error),
    });
    throw error;
  }
};


module.exports = {
  getAll: findAll,
  create,
};

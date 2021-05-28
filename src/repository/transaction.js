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
    logger.error('Error in findAll', {
      error: serializeError(error),
    });
    throw error;
  }
};

/**
 * Calculate the total number of transactions.
 */
const findCount = async () => {
  try {
    const [count] = await getKnex()(tables.transaction)
      .count();
    return count['count(*)'];
  } catch (error) {
    const logger = getChildLogger('transactions-repo');
    logger.error('Error in findCount', {
      error: serializeError(error),
    });
    throw error;
  }
};

/**
 * Find a transaction with the given `id`.
 *
 * @param {string} id - Id of the transaction to find.
 */
const findById = async(id) => {
  try {
    return await getKnex()(tables.transaction)
      .first()
      .where(`${tables.transaction}.id`, id)
      .join(tables.place, `${tables.transaction}.place_id`, '=', `${tables.place}.id`)
      .join(tables.user, `${tables.transaction}.user_id`, '=', `${tables.user}.id`);
  } catch (error) {
    const logger = getChildLogger('transactions-repo');
    logger.error('Error in findById', {
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
 *
 * @returns {Promise<string>} Created transaction's id
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

/**
 * Update an existing transaction.
 *
 * @param {string} id - Id of the transaction to update.
 * @param {object} transaction - The transaction data to save.
 * @param {string} [transaction.amount] - Amount deposited/withdrawn.
 * @param {Date} [transaction.date] - Date of the transaction.
 * @param {string} [transaction.placeId] - Id of the place the transaction happened.
 * @param {string} [transaction.userId] - Id of the user who did the transaction.
 *
 * @returns {Promise<string>} Transaction's id
 */
const updateById = async (id, {
  amount,
  date,
  placeId,
  userId,
}) => {
  try {
    await getKnex()(tables.transaction)
      .update({
        amount,
        date,
        place_id: placeId,
        user_id: userId,
      })
      .where(`${tables.transaction}.id`, id);
    return await getLastId();
  } catch (error) {
    const logger = getChildLogger('transactions-repo');
    logger.error('Error in updateById', {
      error: serializeError(error),
    });
    throw error;
  }
};

/**
 * Delete a transaction with the given `id`.
 *
 * @param {string} id - Id of the transaction to delete.
 *
 * @returns {Promise<boolean>} Whether the transaction was deleted.
 */
const deleteById = async (id) => {
  try {
    const rowsAffected = await getKnex()(tables.transaction)
      .delete()
      .where(`${tables.transaction}.id`, id);
    return rowsAffected > 0;
  } catch (error) {
    const logger = getChildLogger('transactions-repo');
    logger.error('Error in deleteById', {
      error: serializeError(error),
    });
    throw error;
  }
};

module.exports = {
  findAll,
  findCount,
  findById,
  create,
  updateById,
  deleteById,
};

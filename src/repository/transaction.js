const { tables, getKnex } = require('../data/index');
const { getChildLogger } = require('../core/logging');
const { getLastId } = require('./_repository.helpers');

const SELECT_COLUMNS = [
  `${tables.transaction}.id`, 'amount', 'date',
  `${tables.place}.id as place_id`, `${tables.place}.name`,
  `${tables.user}.id as user_id`, `${tables.user}.first_name`,
  `${tables.user}.last_name`,
];

/**
 * Get all `limit` transactions, throws on error.
 *
 * @param {object} pagination - Pagination options
 * @param {number} pagination.limit - Nr of transactions to return.
 * @param {number} pagination.offset - Nr of transactions to skip.
 * @param {string} userId - Id of the user to fetch transactions for.
 */
const findAll = ({
  limit,
  offset,
}, userId) => {
  return getKnex()(tables.transaction)
    .select(SELECT_COLUMNS)
    .join(tables.place, `${tables.transaction}.place_id`, '=', `${tables.place}.id`)
    .join(tables.user, `${tables.transaction}.user_id`, '=', `${tables.user}.id`)
    .where(`${tables.transaction}.user_id`, userId)
    .limit(limit)
    .offset(offset)
    .orderBy('date', 'ASC');
};

/**
 * Calculate the total number of transactions.
 */
const findCount = async () => {
  const [count] = await getKnex()(tables.transaction)
    .count();
  return count['count(*)'];
};

/**
 * Find a transaction with the given `id`.
 *
 * @param {string} id - Id of the transaction to find.
 */
const findById = (id) => {
  return getKnex()(tables.transaction)
    .first(SELECT_COLUMNS)
    .where(`${tables.transaction}.id`, id)
    .join(tables.place, `${tables.transaction}.place_id`, '=', `${tables.place}.id`)
    .join(tables.user, `${tables.transaction}.user_id`, '=', `${tables.user}.id`);
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
      error,
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
      error,
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
      error,
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

const { tables, getKnex } = require('../data/index');
const { getChildLogger } = require('../core/logging');
const { getLastId } = require('./_repository.helpers');

const SELECT_COLUMNS = [
  `${tables.transaction}.id`, 'amount', 'date',
  `${tables.place}.id as place_id`, `${tables.place}.name as place_name`,
  `${tables.user}.id as user_id`, `${tables.user}.name as user_name`,
];

/**
 * Get all transactions for the given user.
 *
 * @param {string} userId - Id of the user to fetch transactions for.
 */
const findAll = (userId) => {
  return getKnex()(tables.transaction)
    .select(SELECT_COLUMNS)
    .join(tables.place, `${tables.transaction}.place_id`, '=', `${tables.place}.id`)
    .join(tables.user, `${tables.transaction}.user_id`, '=', `${tables.user}.id`)
    .where(`${tables.transaction}.user_id`, userId)
    .orderBy('date', 'ASC');
};

/**
 * Calculate the total number of transactions.
 *
 * @param {string} userId - Id of the user to fetch transactions for.
 */
const findCount = async (userId) => {
  const [count] = await getKnex()(tables.transaction)
    .count()
    .where(`${tables.transaction}.user_id`, userId);

  return count['count(*)'];
};

/**
 * Find a transaction with the given `id`.
 *
 * @param {string} id - Id of the transaction to find.
 * @param {string} userId - Id of the user requesting the transaction.
 */
const findById = (id, userId) => {
  return getKnex()(tables.transaction)
    .first(SELECT_COLUMNS)
    .where(`${tables.transaction}.id`, id)
    .andWhere(`${tables.transaction}.user_id`, userId)
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
      })
      .where(`${tables.transaction}.id`, id)
      .andWhere(`${tables.transaction}.user_id`, userId);
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
 * @param {string} userId - Id of the user deleting the transaction.
 *
 * @returns {Promise<boolean>} Whether the transaction was deleted.
 */
const deleteById = async (id, userId) => {
  try {
    const rowsAffected = await getKnex()(tables.transaction)
      .delete()
      .where(`${tables.transaction}.id`, id)
      .andWhere(`${tables.transaction}.user_id`, userId);
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

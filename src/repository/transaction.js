const { tables, getKnex } = require('../data');

const formatTransaction = ({
  user_id,
  place_id,
  place_name,
  user_name,
  email,
  ...transaction
}) => {
  delete transaction.password_hash;
  delete transaction.roles;

  return {
    ...transaction,
    user: {
      id: user_id,
      name: user_name,
      email,
    },
    place: {
      id: place_id,
      name: place_name,
    },
  };
};

const SELECT_COLUMNS = [
  `${tables.transaction}.id`, 'amount', 'date',
  `${tables.place}.id as place_id`, `${tables.place}.name as place_name`,
  `${tables.user}.id as user_id`, `${tables.user}.name as user_name`,
];

/**
 * Get all transactions for the given user.
 *
 * @param {number} userId - Id of the user to fetch transactions for.
 */
const findAll = async (userId) => {
  const transactions = await getKnex()(tables.transaction)
    .select(SELECT_COLUMNS)
    .join(tables.place, `${tables.transaction}.place_id`, '=', `${tables.place}.id`)
    .join(tables.user, `${tables.transaction}.user_id`, '=', `${tables.user}.id`)
    .where(`${tables.transaction}.user_id`, userId)
    .orderBy('date', 'ASC');

  return transactions.map(formatTransaction);
};

/**
 * Calculate the total number of transactions.
 *
 * @param {number} userId - Id of the user to fetch transactions for.
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
 * @param {number} id - Id of the transaction to find.
 */
const findById = async (id) => {
  const transaction = await getKnex()(tables.transaction)
    .first(SELECT_COLUMNS)
    .where(`${tables.transaction}.id`, id)
    .join(tables.place, `${tables.transaction}.place_id`, '=', `${tables.place}.id`)
    .join(tables.user, `${tables.transaction}.user_id`, '=', `${tables.user}.id`);

  return transaction && formatTransaction(transaction);
};

/**
 * Create a new transaction.
 *
 * @param {object} transaction - The transaction to create.
 * @param {number} transaction.amount - Amount deposited/withdrawn.
 * @param {Date} transaction.date - Date of the transaction.
 * @param {number} transaction.placeId - Id of the place the transaction happened.
 * @param {number} transaction.userId - Id of the user who did the transaction.
 *
 * @returns {Promise<number>} Created transaction's id
 */
const create = async ({
  amount,
  date,
  placeId,
  userId,
}) => {
  const [id] = await getKnex()(tables.transaction)
    .insert({
      amount,
      date,
      place_id: placeId,
      user_id: userId,
    });
  return id;
};

/**
 * Update an existing transaction.
 *
 * @param {number} id - Id of the transaction to update.
 * @param {object} transaction - The transaction data to save.
 * @param {number} [transaction.amount] - Amount deposited/withdrawn.
 * @param {Date} [transaction.date] - Date of the transaction.
 * @param {number} [transaction.placeId] - Id of the place the transaction happened.
 * @param {number} [transaction.userId] - Id of the user who did the transaction.
 *
 * @returns {Promise<number>} Transaction's id
 */
const updateById = async (id, {
  amount,
  date,
  placeId,
  userId,
}) => {
  await getKnex()(tables.transaction)
    .update({
      amount,
      date,
      place_id: placeId,
    })
    .where(`${tables.transaction}.id`, id)
    .andWhere(`${tables.transaction}.user_id`, userId);
  return id;
};

/**
 * Delete a transaction with the given `id`.
 *
 * @param {number} id - Id of the transaction to delete.
 * @param {number} userId - Id of the user deleting the transaction.
 *
 * @returns {Promise<boolean>} Whether the transaction was deleted.
 */
const deleteById = async (id, userId) => {
  const rowsAffected = await getKnex()(tables.transaction)
    .delete()
    .where(`${tables.transaction}.id`, id)
    .andWhere(`${tables.transaction}.user_id`, userId);
  return rowsAffected > 0;
};

module.exports = {
  findAll,
  findCount,
  findById,
  create,
  updateById,
  deleteById,
};

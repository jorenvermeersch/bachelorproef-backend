const { transactionRepository } = require('../repository');
const placeService = require('./place');

/**
 * Get all `limit` transactions, skip the first `offset`.
 *
 * @param {number} [limit] - Nr of transactions to fetch.
 * @param {number} [offset] - Nr of transactions to skip.
 */
const getAll = async (limit, offset) => {
  const data = await transactionRepository.findAll({ limit, offset });
  const totalCount = await transactionRepository.findCount();
  return {
    data,
    totalCount,
    count: data.length,
    limit,
    offset,
  };
};

/**
 * Create a new transaction, will create a new place if necessary.
 *
 * @param {object} transaction - The transaction to create.
 * @param {string} transaction.amount - Amount deposited/withdrawn.
 * @param {Date} transaction.date - Date of the transaction.
 * @param {string} transaction.place - Name of the place the transaction happened.
 * @param {string} transaction.userId - Id of the user who did the transaction.
 */
const create = async ({
  amount,
  date,
  place,
  userId,
}) => {
  const existingPlace = await placeService.getByName(place);

  let placeId = existingPlace?.id;
  if (!placeId) {
    placeId = (await placeService.create({ name: place })).id;
  }

  const id = await transactionRepository.create({
    amount,
    date,
    userId,
    placeId,
  });
  return { id };
};

module.exports = {
  getAll,
  create,
};

const ServiceError = require('../core/serviceError');
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
 * Get the transaction with the given `id`.
 *
 * @param {number} id - Id of the transaction to find.
 *
 * @throws {ServiceError} One of:
 * - NOT_FOUND: No transaction with the given id could be found.
 */
const getById = async (id) => {
  const transaction = await transactionRepository.findById(id);

  if (!transaction) {
    throw ServiceError.notFound(`No transaction with id ${id} exists`, { id });
  }

  return transaction;
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
  return getById(id);
};

/**
 * Update an existing transaction, will create a new place if necessary.
 *
 * @param {string} id - Id of the transaction to update.
 * @param {object} transaction - The transaction data to save.
 * @param {string} transaction.amount - Amount deposited/withdrawn.
 * @param {Date} transaction.date - Date of the transaction.
 * @param {string} transaction.place - Name of the place the transaction happened.
 * @param {string} transaction.userId - Id of the user who did the transaction.
 *
 * @throws {ServiceError} One of:
 * - NOT_FOUND: No transaction with the given id could be found.
 */
const updateById = async (id, {
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

  await transactionRepository.updateById(id, {
    amount,
    date,
    userId,
    placeId,
  });
  return getById(id);
};

/**
 * Delete the transaction with the given `id`.
 *
 * @param {number} id - Id of the transaction to delete.
 *
 * @throws {ServiceError} One of:
 * - NOT_FOUND: No transaction with the given id could be found.
 */
const deleteById = async (id) => {
  const deleted = await transactionRepository.deleteById(id);

  if (!deleted) {
    throw ServiceError.notFound(`No transaction with id ${id} exists`);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};

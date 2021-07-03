const config = require('config');
const ServiceError = require('../core/serviceError');
const { transactionRepository } = require('../repository');
const placeService = require('./place');
const handleDBError = require('./_handleDBError');

const DEFAULT_PAGINATION_LIMIT = config.get('pagination.limit');
const DEFAULT_PAGINATION_OFFSET = config.get('pagination.offset');

const makeExposedTransaction = ({
  user_id,
  place_id,
  name,
  first_name,
  last_name,
  email,
  ...transaction
}) => {
  delete transaction.password_hash;
  delete transaction.roles;

  return {
    ...transaction,
    user: {
      id: user_id,
      firstName: first_name,
      lastName: last_name,
      email,
    },
    place: {
      id: place_id,
      name,
    },
  };
};

/**
 * Get all `limit` transactions, skip the first `offset`.
 *
 * @param {object} params - The parameters for this function.
 * @param {number} [params.limit] - Nr of transactions to fetch.
 * @param {number} [params.offset] - Nr of transactions to skip.
 * @param {string} params.userId - Id of the user to fetch transactions for.
 */
const getAll = async ({
  userId,
  limit = DEFAULT_PAGINATION_LIMIT,
  offset = DEFAULT_PAGINATION_OFFSET,
}) => {
  const data = await transactionRepository.findAll({ limit, offset }, userId);
  const totalCount = await transactionRepository.findCount();
  return {
    data: data.map(makeExposedTransaction),
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

  return makeExposedTransaction(transaction);
};

/**
 * Create a new transaction, will create a new place if necessary.
 *
 * @param {object} transaction - The transaction to create.
 * @param {string} transaction.amount - Amount deposited/withdrawn.
 * @param {Date} transaction.date - Date of the transaction.
 * @param {string} transaction.place - Name of the place the transaction happened.
 * @param {string} transaction.userId - Id of the user who did the transaction.
 *
 * @throws {ServiceError} One of:
 * - VALIDATION_FAILED: Transactions created in the future, no place could be created
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

  if (!placeId) {
    throw ServiceError.validationFailed('No place could be created for this transaction');
  }

  const id = await transactionRepository.create({
    amount,
    date,
    userId,
    placeId,
  }).catch(handleDBError);
  return getById(id);
};

/**
 * Update an existing transaction, will create a new place if necessary.
 *
 * @param {string} id - Id of the transaction to update.
 * @param {object} transaction - The transaction data to save.
 * @param {string} [transaction.amount] - Amount deposited/withdrawn.
 * @param {Date} [transaction.date] - Date of the transaction.
 * @param {string} [transaction.place] - Name of the place the transaction happened.
 * @param {string} [transaction.userId] - Id of the user who did the transaction.
 *
 * @throws {ServiceError} One of:
 * - NOT_FOUND: No transaction with the given id could be found.
 * - VALIDATION_FAILED: Transactions created in the future, no place could be created
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

  if (!placeId) {
    throw ServiceError.validationFailed('No place could be created for this transaction');
  }

  await transactionRepository.updateById(id, {
    amount,
    date,
    userId,
    placeId,
  }).catch(handleDBError);
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
    throw ServiceError.notFound(`No transaction with id ${id} exists`, { id });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};

const handleDBError = require('./_handleDBError');
const placeService = require('./place');
const ServiceError = require('../core/error/serviceError');
const { getLogger, authorizationFailed } = require('../core/logging');
const transactionRepository = require('../repository/transaction');

/**
 * Get all transactions for the given user.
 *
 * @param {number} userId - Id of the user to fetch transactions for.
 */
const getAll = async (userId) => {
  const items = await transactionRepository.findAll(userId);
  return {
    items,
    count: items.length,
  };
};

/**
 * Get the transaction with the given `id`.
 *
 * @param {number} id - Id of the transaction to find.
 * @param {number} userId - Id of the user requesting the transaction.
 *
 * @throws {ServiceError} One of:
 * - NOT_FOUND: No transaction with the given id could be found.
 */
const getById = async (id, userId) => {
  const transaction = await transactionRepository.findById(id);

  const notFoundError = ServiceError.notFound(
    `No transaction with id ${id} exists`,
    { id },
  );

  if (!transaction) {
    throw notFoundError;
  }

  if (transaction.user.id !== userId) {
    getLogger().warn(
      `user ${userId} attempted to access transaction ${id} to which they are not authorized`,
      {
        event: authorizationFailed(userId, `api/transactions/${id}`),
      },
    );
    throw notFoundError;
  }

  return transaction;
};

/**
 * Create a new transaction, will create a new place if necessary.
 *
 * @param {object} transaction - The transaction to create.
 * @param {number} transaction.amount - Amount deposited/withdrawn.
 * @param {Date} transaction.date - Date of the transaction.
 * @param {number} transaction.placeId - Id of the place the transaction happened.
 * @param {number} transaction.userId - Id of the user who did the transaction.
 *
 * @throws {ServiceError} One of:
 * - NOT_FOUND: No place with the given id could be found.
 */
const create = async ({ amount, date, placeId, userId }) => {
  const existingPlace = await placeService.getById(placeId);

  if (!existingPlace) {
    throw ServiceError.notFound(`There is no place with id ${placeId}.`, {
      id: placeId,
    });
  }

  const id = await transactionRepository
    .create({
      amount,
      date,
      userId,
      placeId,
    })
    .catch(handleDBError);
  return getById(id, userId);
};

/**
 * Update an existing transaction, will create a new place if necessary.
 *
 * @param {number} id - Id of the transaction to update.
 * @param {object} transaction - The transaction data to save.
 * @param {number} [transaction.amount] - Amount deposited/withdrawn.
 * @param {Date} [transaction.date] - Date of the transaction.
 * @param {number} [transaction.placeId] - Id of the place the transaction happened.
 * @param {number} [transaction.userId] - Id of the user who did the transaction.
 *
 * @throws {ServiceError} One of:
 * - NOT_FOUND: No transaction/place with the given id could be found.
 */
const updateById = async (id, { amount, date, placeId, userId }) => {
  // Only perform the check if an id is given, will otherwise cause NOT FOUND if `undefined`
  if (placeId) {
    const existingPlace = await placeService.getById(placeId);

    if (!existingPlace) {
      throw ServiceError.notFound(`There is no place with id ${id}.`, { id });
    }
  }

  await transactionRepository
    .updateById(id, {
      amount,
      date,
      userId,
      placeId,
    })
    .catch(handleDBError);
  return getById(id, userId);
};

/**
 * Delete the transaction with the given `id`.
 *
 * @param {number} id - Id of the transaction to delete.
 * @param {number} userId - Id of the user deleting the transaction.
 *
 * @throws {ServiceError} One of:
 * - NOT_FOUND: No transaction with the given id could be found.
 */
const deleteById = async (id, userId) => {
  const deleted = await transactionRepository.deleteById(id, userId);

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

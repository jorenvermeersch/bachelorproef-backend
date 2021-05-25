const { getKnex } = require('../data/index');
const { serializeError } = require('serialize-error');
const { getChildLogger } = require('../core/logging');

/**
 * Get all `limit` transactions, throws on error.
 *
 * @param {number} limit - Nr of transactions to return.
 */
async function getAll(limit) {
  try {
    const transactions = await getKnex()('transactions')
      .select()
      .limit(limit);

    return transactions;
  } catch (error) {
    const logger = getChildLogger('transactions-repo');
    logger.error('Error in getAll', {
      error: serializeError(error),
    });
    throw error;
  }
}

module.exports = {
  getAll,
};

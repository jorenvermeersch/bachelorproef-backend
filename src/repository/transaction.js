const { tables, getKnex } = require('../data/index');
const { serializeError } = require('serialize-error');
const { getChildLogger } = require('../core/logging');

/**
 * Get all `limit` transactions, throws on error.
 *
 * @param {number} [limit] - Nr of transactions to return.
 */
async function getAll(limit) {
  try {
    const query = getKnex()(tables.transaction)
      .select(
        `${tables.transaction}.id`, 'amount', 'date',
        `${tables.place}.name AS place`, `${tables.user}.name AS user`,
      )
      .join(tables.place, `${tables.transaction}.place_id`, '=', `${tables.place}.id`)
      .join(tables.user, `${tables.transaction}.user_id`, '=', `${tables.user}.id`);

    return await (limit ? query.limit(limit) : query);
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

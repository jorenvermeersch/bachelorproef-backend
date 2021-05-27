const { getKnex } = require('../data');

/**
 * Fetch the last created UUID.
 */
const getLastId = async () => {
  // MySQL does not support the RETURNING clause, so we fix this here
  const [rows] = await getKnex().raw('SELECT @last_uuid');
  return rows?.[0]?.['@last_uuid'];
};

module.exports = {
  getLastId,
};

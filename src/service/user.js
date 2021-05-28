const { userRepository } = require('../repository');

/**
 * Get all `limit` places, skip the first `offset`.
 *
 * @param {number} [limit] - Nr of places to fetch.
 * @param {number} [offset] - Nr of places to skip.
 */
const getAll = async (limit, offset) => {
  const data = await userRepository.findAll({ limit, offset });
  const totalCount = await userRepository.findCount();
  return {
    data,
    totalCount,
    count: data.length,
    limit,
    offset,
  };
};

module.exports = {
  getAll,
};

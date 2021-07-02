const { tables, getKnex } = require('../data/index');
const { serializeError } = require('serialize-error');
const { getChildLogger } = require('../core/logging');
const { getLastId } = require('./_repository.helpers');

/**
 * Get all `limit` users, skip the first `offset`.
 *
 * @param {object} pagination - Pagination options
 * @param {number} pagination.limit - Nr of transactions to return.
 * @param {number} pagination.offset - Nr of transactions to skip.
 */
const findAll = async ({
  limit,
  offset,
}) => {
  try {
    return await getKnex()(tables.user)
      .select()
      .limit(limit)
      .offset(offset)
      .orderBy(['first_name', 'last_name'], 'ASC');
  } catch (error) {
    const logger = getChildLogger('users-repo');
    logger.error('Error in findAll', {
      error: serializeError(error),
    });
    throw error;
  }
};

/**
 * Calculate the total number of user.
 */
const findCount = async () => {
  try {
    const [count] = await getKnex()(tables.user)
      .count();
    return count['count(*)'];
  } catch (error) {
    const logger = getChildLogger('users-repo');
    logger.error('Error in findCount', {
      error: serializeError(error),
    });
    throw error;
  }
};

/**
 * Find a user with the given id.
 *
 * @param {string} id - The id to search for.
 */
const findById = async (id) => {
  try {
    const user = await getKnex()(tables.user)
      .where('id', id)
      .first();
    return user;
  } catch (error) {
    const logger = getChildLogger('users-repo');
    logger.error('Error in findById', {
      error: serializeError(error),
    });
    throw error;
  }
};

/**
 * Find a user with the given email.
 *
 * @param {string} email - The email to search for.
 */
const findByEmail = async (email) => {
  try {
    const user = await getKnex()(tables.user)
      .where('email', email)
      .first();
    return user;
  } catch (error) {
    const logger = getChildLogger('users-repo');
    logger.error('Error in findByEmail', {
      error: serializeError(error),
    });
    throw error;
  }
};

/**
 * Create a new user with the given `name`.
 *
 * @param {object} user - User to create.
 * @param {string} user.firstName - First name of the user.
 * @param {string} user.lastName - Last name of the user.
 * @param {string} user.email - Email of the user.
 * @param {string} user.passwordHash - Hashed password of the user.
 * @param {string[]} user.roles - Roles of the user.
 */
const create = async ({
  firstName,
  lastName,
  email,
  passwordHash,
  roles,
}) => {
  try {
    await getKnex()(tables.user)
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        password_hash: passwordHash,
        roles: JSON.stringify(roles),
      });
    return await getLastId();
  } catch (error) {
    const logger = getChildLogger('users-repo');
    logger.error('Error in create', {
      error: serializeError(error),
    });
    throw error;
  }
};

module.exports = {
  findAll,
  findCount,
  findById,
  findByEmail,
  create,
};

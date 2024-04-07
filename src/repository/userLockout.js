const { tables, getKnex } = require('../data');

/**
 * Create a new user lockout record.
 *
 * @param {number} userId - Id of the user.
 * @returns {Promise<number>} The user lockout record's id.
 */
const create = async (userId) => {
  const [id] = await getKnex()(tables.userLockout).insert({
    user_id: userId,
  });

  return id;
};

/**
 * Find account lockout information for the given `userId`.
 *
 * @param {number} userId - Id of the user.
 * @returns {Promise<object>} The user's account lockout information, or `undefined` if none was found.
 */
const findByUserId = async (userId) => {
  const userLockout = await getKnex()(tables.userLockout)
    .where('user_id', userId)
    .first();

  if (!userLockout) {
    return;
  }

  const { id, user_id, failed_login_attempts, end_time } = userLockout;
  return {
    id,
    userId: user_id,
    failedLoginAttempts: failed_login_attempts,
    endTime: end_time,
  };
};

/**
 * Update account lockout information for the given `userId`.
 *
 * @param {number} userId - Id of the user.
 * @param {object} lockout - The account lockout information to update.
 * @param {number} lockout.failedLoginAttempts - The number of failed login attempts.
 * @param {Date} lockout.endTime - The end time of the account lockout.
 */
const updateByUserId = async (userId, { failedLoginAttempts, endTime }) => {
  await getKnex()(tables.userLockout)
    .update({
      failed_login_attempts: failedLoginAttempts,
      end_time: endTime,
    })
    .where('user_id', userId);
};

/**
 * Reset account lockout information for the given `userId`.
 *
 * @param {number} userId - Id of the user.
 */
const resetByUserId = async (userId) => {
  await updateByUserId(userId, {
    failedLoginAttempts: 0,
    endTime: null,
  });
};

/**
 * Deletes account lockout information for the given `userId`.
 *
 * @param {number} userId - Id of the user.
 * @returns {Promise<boolean>} `true` if any lockout information was deleted, `false` otherwise
 */
const deleteByUserId = async (userId) => {
  const rowsAffected = await getKnex()(tables.userLockout)
    .where('user_id', userId)
    .delete();
  return rowsAffected > 0;
};

module.exports = {
  create,
  findByUserId,
  updateByUserId,
  resetByUserId,
  deleteByUserId,
};

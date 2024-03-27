const { tables, getKnex } = require('../data');

/**
 * Create a new password reset request.
 *
 * @param {object} resetRequest - The reset request to create.
 * @param {number} resetRequest.userId - Id of the user requesting the reset.
 * @param {string} resetRequest.tokenHash - Hash of the reset token.
 * @param {Date} resetRequest.tokenExpiry - Expiry date of the reset token.
 */
const createResetRequest = async ({ userId, tokenHash, tokenExpiry }) => {
  await getKnex()(tables.passwordResetRequest).insert({
    user_id: userId,
    token_hash: tokenHash,
    token_expiry: tokenExpiry,
  });
};

/**
 * Find the password reset request for the given `userId`.
 *
 * @param {number} userId - Id of the user requesting the password reset.
 *
 * @returns {Promise<object>} The password reset request, or `undefined` if none was found.
 */
const findResetRequestByUserId = async (userId) => {
  const resetRequest = await getKnex()(tables.passwordResetRequest)
    .where('user_id', userId)
    .first();

  if (!resetRequest) {
    return;
  }

  const { user_id, token_hash, token_expiry } = resetRequest;
  return {
    userId: user_id,
    tokenHash: token_hash,
    tokenExpiry: token_expiry,
  };
};

/**
 * Delete all password reset requests for the given `userId`.
 *
 * @param {number} userId - Id of the user.
 * @returns {Promise<boolean>} `true` if any reset requests were deleted, `false` otherwise.
 */
const deleteResetRequestsByUserId = async (userId) => {
  const rowsAffected = await getKnex()(tables.passwordResetRequest)
    .delete()
    .where('user_id', userId);
  return rowsAffected > 0;
};

module.exports = {
  createResetRequest,
  findResetRequestByUserId,
  deleteResetRequestsByUserId,
};

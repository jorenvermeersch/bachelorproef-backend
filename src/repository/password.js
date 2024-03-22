const { tables, getKnex } = require('../data');

const createResetRequest = async ({ userId, tokenHash, tokenExpiry }) => {
  await getKnex()(tables.passwordResetRequest).insert({
    user_id: userId,
    token_hash: tokenHash,
    token_expiry: tokenExpiry,
  });
};

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

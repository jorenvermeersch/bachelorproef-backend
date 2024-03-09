const { tables, getKnex } = require('../data');

const createResetToken = async ({ userId, token, tokenExpiry }) => {
  await getKnex()(tables.passwordResetToken).insert({
    user_id: userId,
    token,
    token_expiry: tokenExpiry,
  });
};

const deleteResetTokensByUserId = async (userId) => {
  const rowsAffected = await getKnex()(tables.passwordResetToken)
    .delete()
    .where('user_id', userId);
  return rowsAffected > 0;
};

module.exports = {
  createResetToken,
  deleteResetTokensByUserId,
};

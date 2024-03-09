const crypto = require('crypto');
const { addMinutes } = require('date-fns');

const userService = require('./user');
const passwordRepository = require('../repository/password');

// TODO: Add JSDoc.
const requestReset = async (email) => {
  let user;
  try {
    user = await userService.getByEmail(email);
  } catch (error) {
    return;
  }

  const { id } = user;
  await passwordRepository.deleteResetTokensByUserId(id);
  const token = crypto.randomUUID(); // Cryptographically secure.

  await passwordRepository.createResetToken({
    userId: id,
    token,
    tokenExpiry: addMinutes(new Date(), 10),
  });

  // TODO: Send e-mail with token.
};

// TODO: Add JSDoc.
const reset = async ({ token, newPassword }) => {};

module.exports = {
  requestReset,
  reset,
};

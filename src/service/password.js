const crypto = require('crypto');
const { addMinutes } = require('date-fns');
const { URLSearchParams } = require('url');

const userService = require('./user');
const { hashSecret, verifySecret } = require('../core/hashing');
const { sendMail } = require('../core/mail');
const ServiceError = require('../core/serviceError');
const passwordRepository = require('../repository/password');

/**
 * Sends a password reset e-mail if a user with the given `email` exists.
 *
 * @param {string} email - The e-mail address of the user.
 * @param {string} origin - The origin of the request.
 */
const requestReset = async (email, origin) => {
  let user;
  try {
    user = await userService.getByEmail(email);
  } catch (error) {
    // No error thrown to protect against user enumeration attacks.
    return;
  }

  const { id } = user;
  await passwordRepository.deleteResetRequestsByUserId(id);
  const token = crypto.randomUUID(); // Cryptographically secure.
  const tokenHash = await hashSecret(token);

  await passwordRepository.createResetRequest({
    userId: id,
    tokenHash,
    tokenExpiry: addMinutes(new Date(), 10),
  });

  const queryParameters = new URLSearchParams({ email, token });
  const url = `${origin}/password-reset?${queryParameters}`; // Origin already checked with CORS.

  await sendMail({
    to: email,
    subject: 'Request for password reset',
    text: `Click the following link to reset your password: ${url}`,
    html: `<p>Click <a href="${url}" target="_blank">here</a> to reset your password.</p>`,
  });
};

/**
 * Resets the password of a user with the given `email`.
 *
 * @param {object} data - The reset request data.
 * @param {string} data.email - The e-mail address of the user.
 * @param {string} data.newPassword - The new password.
 * @param {string} data.token - The reset token (uuidv4).
 *
 * @throws {ServiceError} in the following cases:
 * - User with the given e-mail address does not exist.
 * - The user exists, but no password reset request exist in the database.
 * - The provided token is invalid or has expired.
 */
const reset = async ({ email, newPassword, token }) => {
  const tokenOrEmailError = ServiceError.validationFailed(
    'The given email is invalid or the reset request has expired',
  );

  let user;
  try {
    user = await userService.getByEmail(email);
  } catch (error) {
    // User with given e-mail does not exist.
    throw tokenOrEmailError;
  }

  const { id } = user;
  const resetRequest = await passwordRepository.findResetRequestByUserId(id);

  // User exists, but no password reset was requested.
  if (!resetRequest) {
    throw tokenOrEmailError;
  }

  const { tokenHash: resetTokenHash, tokenExpiry } = resetRequest;
  const isCorrectToken = await verifySecret(token, resetTokenHash);

  // Provided token is not valid or has expired.
  if (!isCorrectToken || tokenExpiry < new Date()) {
    throw tokenOrEmailError;
  }

  const passwordHash = await hashSecret(newPassword);
  await userService.updateById(id, { passwordHash });
  await passwordRepository.deleteResetRequestsByUserId(id);
};

module.exports = {
  requestReset,
  reset,
};

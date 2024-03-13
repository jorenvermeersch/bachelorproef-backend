const crypto = require('crypto');
const { addMinutes } = require('date-fns');
const { URLSearchParams } = require('url');

const userService = require('./user');
const { sendMail } = require('../core/mail');
const { hashPassword } = require('../core/password');
const ServiceError = require('../core/serviceError');
const passwordRepository = require('../repository/password');

// TODO: Add JSDoc.
const requestReset = async (email, origin) => {
  let user;
  try {
    user = await userService.getByEmail(email);
  } catch (error) {
    return;
  }

  const { id } = user;
  await passwordRepository.deleteResetRequestsByUserId(id);
  const token = crypto.randomUUID(); // Cryptographically secure.

  await passwordRepository.createResetRequest({
    userId: id,
    token,
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

// TODO: Add JSDoc.
const reset = async ({ email, newPassword, token }) => {
  const tokenOrEmailError = ServiceError.validationFailed(
    'The given email is invalid or the reset request has expired.',
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

  const { token: resetToken, tokenExpiry } = resetRequest;

  // Provided token is not valid or has epired.
  if (token !== resetToken || tokenExpiry < new Date()) {
    throw tokenOrEmailError;
  }

  const passwordHash = await hashPassword(newPassword);
  await userService.updateById(id, { passwordHash });
  await passwordRepository.deleteResetRequestsByUserId(id);
};

module.exports = {
  requestReset,
  reset,
};

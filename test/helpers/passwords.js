/**
 * Requests a password reset for a user with the given `email`.
 * This method was defined to reduce code duplication in the tests.
 *
 * @param {string} email - The user's email.
 * @param {supertest.SuperTest<supertest.Test>} supertest - The supertest agent to use.
 * @returns {Object} The response object
 */
const requestReset = async (email, supertest) => {
  const response = await supertest.post('/api/password/request-reset').send({
    email: email,
  });

  return response;
};

/**
 * Extracts the token and user email from the password reset email.
 *
 * @param {Object} email - The nodemailer-mock email object.
 * @returns {Object} Object containing the token and email.
 */
const parseResetEmail = (email) => {
  if (!email) {
    throw new Error('Email is required.');
  }

  const { text, to } = email;

  // The origin is undefined when testing, so you can't use `text` to create an URL.
  const params = new URLSearchParams(text.split('/')[1]);
  const token = params.get('token');

  return { token, email: to };
};

module.exports = { requestReset, parseResetEmail };

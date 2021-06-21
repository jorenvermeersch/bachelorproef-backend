const ServiceError = require('../core/serviceError');
const { verifyPassword } = require('../core/auth');
const { generateJWT } = require('../core/jwt');
const { userRepository } = require('../repository');

/**
 * Only return the public information about the given user.
 */
const makeExposedUser = ({ id, name, email }) => ({
  id,
  name,
  email,
});

/**
 * Try to login a user with the given username and password.
 *
 * @param {string} email - The email to try.
 * @param {string} password - The password to try.
 *
 * @returns {Promise<object>} - Promise whichs resolves in an object containing the token and signed in user.
 */
const login = async (email, password) => {
  if (!email || !password) {
    throw ServiceError.validationFailed('Email and password are both required');
  }

  const user = await userRepository.findByEmail(email);

  if (!user) {
    // DO NOT expose we don't know the user
    throw ServiceError.unauthorized('The given email and password do not match');
  }

  const passwordValid = await verifyPassword(password, user.password_hash);

  if (!passwordValid) {
    // DO NOT expose we know the user but an invalid password was given
    throw ServiceError.unauthorized('The given email and password do not match');
  }

  const token = await generateJWT(user);

  return {
    user: makeExposedUser(user),
    token,
  };
};

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
  login,
  getAll,
};

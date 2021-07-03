const config = require('config');
const ServiceError = require('../core/serviceError');
const { verifyPassword, hashPassword } = require('../core/auth');
const { generateJWT } = require('../core/jwt');
const { userRepository } = require('../repository');
const handleDBError = require('./_handleDBError');

const DEFAULT_PAGINATION_LIMIT = config.get('pagination.limit');
const DEFAULT_PAGINATION_OFFSET = config.get('pagination.offset');

/**
 * Only return the public information about the given user.
 */
const makeExposedUser = ({ id, first_name, last_name, email }) => ({
  id,
  firstName: first_name,
  lastName: last_name,
  email,
});

/**
 * Create the returned information after login.
 */
const makeLoginData = async (user) => {
  const token = await generateJWT(user);

  return {
    user: makeExposedUser(user),
    token,
  };
};

/**
 * Try to login a user with the given username and password.
 *
 * @param {string} email - The email to try.
 * @param {string} password - The password to try.
 *
 * @returns {Promise<object>} - Promise whichs resolves in an object containing the token and signed in user.
 */
const login = async (email, password) => {
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

  return await makeLoginData(user);
};

/**
 * Register a new user
 *
 * @param {object} user - The user's data.
 * @param {string} user.firstName - The user's first name.
 * @param {string} user.lastName - The user's last name.
 * @param {string} user.email - The user's email.
 * @param {string} user.password - The user's password.
 *
 * @returns {Promise<object>} - Promise whichs resolves in an object containing the token and signed in user.
 */
const register = async ({
  firstName,
  lastName,
  email,
  password,
}) => {
  const passwordHash = await hashPassword(password);

  const userId = await userRepository.create({
    firstName,
    lastName,
    email,
    passwordHash,
    roles: ['user'],
  }).catch(handleDBError);

  const user = await userRepository.findById(userId);

  return await makeLoginData(user);
};

/**
 * Get all `limit` users, skip the first `offset`.
 *
 * @param {number} [limit] - Nr of users to fetch.
 * @param {number} [offset] - Nr of places to skip.
 */
const getAll = async (
  limit = DEFAULT_PAGINATION_LIMIT,
  offset = DEFAULT_PAGINATION_OFFSET,
) => {
  const data = await userRepository.findAll({ limit, offset });
  const totalCount = await userRepository.findCount();
  return {
    data: data.map(makeExposedUser),
    totalCount,
    count: data.length,
    limit,
    offset,
  };
};

/**
 * Get the user with the given id.
 *
 * @param {string} id - Id of the user to get.
 *
 * @throws {ServiceError} One of:
 * - NOT_FOUND: No user with the given id could be found.
 */
const getById = async (id) => {
  const user = await userRepository.findById(id);

  if (!user) {
    throw ServiceError.notFound(`No user with id ${id} exists`, { id });
  }

  return makeExposedUser(user);
};

module.exports = {
  login,
  register,
  getAll,
  getById,
};
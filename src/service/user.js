const ServiceError = require('../core/serviceError');
const { verifyPassword, hashPassword } = require('../core/auth');
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

  return await makeLoginData(user);
};

/**
 * Register a new user
 *
 * @param {object} user - The user's data.
 * @param {string} user.name - The user's name.
 * @param {string} user.email - The user's email.
 * @param {string} user.password - The user's password.
 * @param {string[]} user.roles - The user's roles.
 *
 * @returns {Promise<object>} - Promise whichs resolves in an object containing the token and signed in user.
 */
const register = async ({
  name,
  email,
  password,
  roles,
}) => {
  const passwordHash = await hashPassword(password);

  const userId = await userRepository.create({
    name,
    email,
    password_hash: passwordHash,
    roles,
  });

  const user = await getById(userId);

  return await makeLoginData(user);
};

/**
 * Get all `limit` users, skip the first `offset`.
 *
 * @param {number} [limit] - Nr of users to fetch.
 * @param {number} [offset] - Nr of places to skip.
 */
const getAll = async (limit, offset) => {
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
    throw ServiceError.notFound(`No user with id ${id} exists`);
  }

  return makeExposedUser(user);
};

module.exports = {
  login,
  register,
  getAll,
  getById,
};

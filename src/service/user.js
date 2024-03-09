const config = require('config');

const handleDBError = require('./_handleDBError');
const { generateJWT, verifyJWT } = require('../core/jwt');
const { getLogger } = require('../core/logging');
const { verifyPassword, hashPassword } = require('../core/password');
const Role = require('../core/roles');
const ServiceError = require('../core/serviceError');
const userRepository = require('../repository/user');

const AUTH_DISABLED = config.get('auth.disabled');

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
  const user = await userRepository.findByEmail(email);

  if (!user) {
    // DO NOT expose we don't know the user
    throw ServiceError.unauthorized(
      'The given email and password do not match',
    );
  }

  const passwordValid = await verifyPassword(password, user.password_hash);

  if (!passwordValid) {
    // DO NOT expose we know the user but an invalid password was given
    throw ServiceError.unauthorized(
      'The given email and password do not match',
    );
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
 *
 * @returns {Promise<object>} - Promise whichs resolves in an object containing the token and signed in user.
 */
const register = async ({ name, email, password }) => {
  const passwordHash = await hashPassword(password);

  const userId = await userRepository
    .create({
      name,
      email,
      passwordHash,
      roles: [Role.USER],
    })
    .catch(handleDBError);

  const user = await userRepository.findById(userId);

  return await makeLoginData(user);
};

/**
 * Check and parse a JWT from the given header into a valid session
 * if possible.
 *
 * @param {string} authHeader - The bare 'Authorization' header to parse
 *
 * @throws {ServiceError} One of:
 * - UNAUTHORIZED: Invalid JWT token provided, possible errors:
 *   - no token provided
 *   - incorrect 'Bearer' prefix
 *   - expired JWT
 *   - other unknown error
 */
const checkAndParseSession = async (authHeader) => {
  // Allow any user if authentication/authorization is disabled
  // DO NOT use this config parameter in any production worthy application!
  if (AUTH_DISABLED) {
    // Create a session for user Thomas Aelbrecht
    return {
      userId: 1,
      roles: [Role.USER],
    };
  }

  if (!authHeader) {
    throw ServiceError.unauthorized('You need to be signed in');
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw ServiceError.unauthorized('Invalid authentication token');
  }

  const authToken = authHeader.substring(7);
  try {
    const { roles, sub } = await verifyJWT(authToken);

    // Save the decoded session data in the current context's state
    return {
      userId: Number(sub),
      roles,
      authToken,
    };
  } catch (error) {
    getLogger().error(error.message, { error });
    throw ServiceError.unauthorized(error.message);
  }
};

/**
 * Check if the given roles include the given required role.
 *
 * @param {string} role - Role to require.
 * @param {string[]} roles - Roles of the user.
 *
 * @returns {void} Only throws if role included.
 *
 * @throws {ServiceError} One of:
 * - UNAUTHORIZED: Role not included in the array.
 */
const checkRole = (role, roles) => {
  // Allow any user if authentication/authorization is disabled
  // DO NOT use this config parameter in any production worthy application!
  if (AUTH_DISABLED) {
    return;
  }

  const hasPermission = roles.includes(role);

  if (!hasPermission) {
    throw ServiceError.forbidden(
      'You are not allowed to view this part of the application',
    );
  }
};

/**
 * Get all users.
 */
const getAll = async () => {
  const items = await userRepository.findAll();
  return {
    items: items.map(makeExposedUser),
    count: items.length,
  };
};

/**
 * Get the user with the given id.
 *
 * @param {number} id - Id of the user to get.
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

const getByEmail = async (email) => {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw ServiceError.notFound(`No user with email ${email} exists`, {
      email,
    });
  }

  return makeExposedUser(user);
};

/**
 * Update an existing user.
 *
 * @param {number} id - Id of the user to update.
 * @param {object} user - User to save.
 * @param {string} [user.name] - Name of the user.
 * @param {number} [user.email] - Email of the user.
 *
 * @throws {ServiceError} One of:
 * - NOT_FOUND: No user with the given id could be found.
 * - VALIDATION_FAILED: A user with the same email exists.
 */
const updateById = async (id, { name, email, passwordHash }) => {
  await userRepository
    .updateById(id, { name, email, passwordHash })
    .catch(handleDBError);
  return getById(id);
};

/**
 * Delete an existing user.
 *
 * @param {number} id - Id of the user to delete.
 *
 * @throws {ServiceError} One of:
 * - NOT_FOUND: No user with the given id could be found.
 */
const deleteById = async (id) => {
  const deleted = await userRepository.deleteById(id);

  if (!deleted) {
    throw ServiceError.notFound(`No user with id ${id} exists`, { id });
  }
};

module.exports = {
  login,
  register,
  checkAndParseSession,
  checkRole,
  getAll,
  getById,
  getByEmail,
  updateById,
  deleteById,
};

const config = require('config');
const { addMinutes, differenceInMinutes } = require('date-fns');

const handleDBError = require('./_handleDBError');
const ServiceError = require('../core/error/serviceError');
const { verifySecret, hashSecret } = require('../core/hashing');
const { generateJWT, verifyJWT } = require('../core/jwt');
const {
  getLogger,
  authentication: {
    loginSuccess,
    loginSuccessAfterFail,
    loginFailed,
    loginLock,
  },
} = require('../core/logging');
const Role = require('../core/roles');
const userRepository = require('../repository/user');
const userLockoutRespository = require('../repository/userLockout');

const AUTH_DISABLED = config.get('auth.disabled');
const MAX_FAILED_LOGIN_ATTEMPTS = config.get('auth.maxFailedAttempts');

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
 * Creates a service error for an account lockout. It calculates the
 * remaining lockout time and adds the necessary security logging information to `logInfo`.
 *
 * @param {number} userId - Id of the user.
 * @param {Date} endTime - Endtime of the user lockout.
 * @returns {ServiceError.unauthorized} Unauthorized error.
 */
const makeLockoutError = (userId, endTime) => {
  const remainingMinutes = differenceInMinutes(endTime, new Date());

  return ServiceError.unauthorized(
    `The account is locked. Please try again in ${remainingMinutes} minutes`,
    undefined,
    {
      event: loginLock(userId, MAX_FAILED_LOGIN_ATTEMPTS),
      description: `user ${userId} is account locked because maxretries exceeded`,
    },
  );
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
      undefined,
      {
        event: loginFailed(),
      },
    );
  }

  const { id: userId } = user;

  let lockout = await userLockoutRespository.findByUserId(userId);

  if (lockout.endTime && lockout.endTime < new Date()) {
    await userLockoutRespository.resetByUserId(userId);
    lockout = await userLockoutRespository.findByUserId(userId);
  }

  const { failedLoginAttempts, endTime } = lockout;

  if (failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
    throw makeLockoutError(userId, endTime);
  }

  const passwordValid = await verifySecret(password, user.passwordHash);

  if (passwordValid) {
    await userLockoutRespository.resetByUserId(userId);

    getLogger().info(`user ${userId} successfully signed in`, {
      event:
        failedLoginAttempts > 0
          ? loginSuccessAfterFail(userId, failedLoginAttempts)
          : loginSuccess(userId),
    });
    return await makeLoginData(user);
  }

  const attempts = failedLoginAttempts + 1;
  const lockoutEndTime = addMinutes(new Date(), 30);

  await userLockoutRespository.updateByUserId(userId, {
    failedLoginAttempts: attempts,
    endTime:
      attempts === MAX_FAILED_LOGIN_ATTEMPTS ? lockoutEndTime : undefined,
  });

  if (attempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
    throw makeLockoutError(userId, lockoutEndTime);
  }

  // DO NOT expose we know the user but an invalid password was given
  throw ServiceError.unauthorized(
    'The given email and password do not match',
    undefined,
    {
      event: loginFailed(userId),
    },
  );
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
  const passwordHash = await hashSecret(password);

  const userId = await userRepository
    .create({
      name,
      email,
      passwordHash,
      roles: [Role.USER],
    })
    .catch(handleDBError);

  await userLockoutRespository.create(userId);

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

  return user;
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
  await userLockoutRespository.deleteByUserId(id);
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

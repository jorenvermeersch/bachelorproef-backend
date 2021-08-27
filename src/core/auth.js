const config = require('config');
const argon2 = require('argon2');
const { verifyJWT } = require('./jwt');

const AUTH_DISABLED = config.get('auth.disabled');
const ARGON_SALT_LENGTH = config.get('auth.argon.saltLength');
const ARGON_HASH_LENGTH = config.get('auth.argon.hashLength');
const ARGON_TIME_COST = config.get('auth.argon.timeCost');
const ARGON_MEMORY_COST = config.get('auth.argon.memoryCost');

/**
 * Hash the given password.
 *
 * @param password - The password to hash.
 */
const hashPassword = async (password) => {
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    saltLength: ARGON_SALT_LENGTH,
    hashLength: ARGON_HASH_LENGTH,
    timeCost: ARGON_TIME_COST,
    memoryCost: ARGON_MEMORY_COST,
  });

  return passwordHash;
};

/**
 * Check if the given password equals the hashed password.
 *
 * @param password - The password to verify.
 * @param passwordHash - The hashed password.
 *
 * @returns {Promise<boolean>} Whether the password is valid.
 */
const verifyPassword = async (password, passwordHash) => {
  const valid = await argon2.verify(
    passwordHash, password, {
      type: argon2.argon2id,
      saltLength: ARGON_SALT_LENGTH,
      hashLength: ARGON_HASH_LENGTH,
      timeCost: ARGON_TIME_COST,
      memoryCost: ARGON_MEMORY_COST,
    },
  );

  return valid;
};

/**
 * Middleware to enforce a JWT in every request.
 */
const requireAuthentication = async (ctx, next) => {
  // Allow any user if authentication/authorization is disabled
  // DO NOT use this config parameter in any production worthy application!
  if (AUTH_DISABLED) {
    // Create a session for user Thomas Aelbrecht
    ctx.state.session = {
      userId: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
      roles: ['user'],
    };
    return next();
  }

  const {
    authorization,
  } = ctx.headers;

  if (!authorization) {
    return ctx.throw(
      401, 'You need to be signed in', {
        code: 'UNAUTHORIZED',
      },
    );
  }

  if (!authorization.startsWith('Bearer ')) {
    return ctx.throw(
      401, 'Invalid authentication token', {
        code: 'UNAUTHORIZED',
      },
    );
  }

  const authToken = authorization.substr(7);
  try {
    const {
      roles, userId,
    } = await verifyJWT(authToken);

    // Save the decoded session data in the current context's state
    ctx.state.session = {
      userId,
      roles,
    };
    // Also save the JWT in case we e.g. need to perform a request in the name of the current user
    ctx.state.authToken = authToken;

    return next();
  } catch (error) {
    return ctx.throw(
      401, error.message, {
        code: 'UNAUTHORIZED',
      },
    );
  }
};

/**
 * Create a Koa middleware whichs enforces the given role.
 *
 * **Requires JWT session data to be decoded before this middleware is called**
 *
 * @param {string} role - The role to have.
 *
 * @returns {Function} - A Koa middleware.
 */
const makeRequireRole = (role) => async (ctx, next) => {
  // Allow any user if authentication/authorization is disabled
  // DO NOT use this config parameter in any production worthy application!
  if (AUTH_DISABLED) {
    return next();
  }

  const {
    roles = [],
  } = ctx.state.session;
  const hasPermission = roles.includes(role);

  if (!hasPermission) {
    return ctx.throw(
      403, 'You are not allowed to view this part of the application', {
        code: 'UNAUTHORIZED',
      },
    );
  }

  return next();
};

module.exports = {
  hashPassword,
  verifyPassword,
  requireAuthentication,
  makeRequireRole,
};

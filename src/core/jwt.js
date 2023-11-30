const config = require('config');
const jwt = require('jsonwebtoken');

const { getLogger } = require('./logging');

const JWT_AUDIENCE = config.get('auth.jwt.audience');
const JWT_SECRET = config.get('auth.jwt.secret');
const JWT_ISSUER = config.get('auth.jwt.issuer');
const JWT_EXPIRATION_INTERVAL = config.get('auth.jwt.expirationInterval');

/**
 * Session data stored in the JWT.
 *
 * @typedef {Object} Session
 *
 * @property {number} userId - Id of the user
 * @property {string[]} roles - Roles of the user
 */

/**
 * Sign a JWT.
 *
 * @param {object} user - User to create a JWT for.
 *
 * @returns {Promise<string>} A promise resolving in the JWT.
 */
const generateJWT = async (user) => {
  const tokenData = {
    roles: user.roles,
  };

  const signOptions = {
    expiresIn: Math.floor(JWT_EXPIRATION_INTERVAL / 1000),
    audience: JWT_AUDIENCE,
    issuer: JWT_ISSUER,
    subject: `${user.id}`,
  };

  return new Promise((resolve, reject) => {
    jwt.sign(
      tokenData, JWT_SECRET, signOptions, (err, token) => {
        if (err) {
          getLogger().error('Error while signing new token:', err.message);
          return reject(err);
        }
        return resolve(token);
      },
    );
  });
};

/**
 * Verify a given JWT for validity.
 *
 * @param authToken - The token to verify.
 *
 * @returns {Session} The decoded token if valid.
 */
const verifyJWT = async (authToken) => {
  const verifyOptions = {
    audience: JWT_AUDIENCE,
    issuer: JWT_ISSUER,
  };

  return new Promise((resolve, reject) => {
    jwt.verify(
      authToken, JWT_SECRET, verifyOptions, (err, decodedToken) => {
        if (err || !decodedToken) {
          getLogger().error('Error while verifying token:', err.message);
          return reject(err || new Error('Token could not be parsed'));
        }
        return resolve(decodedToken);
      },
    );
  });
};

module.exports = {
  generateJWT,
  verifyJWT,
};

const config = require("config");
const jwt = require("jsonwebtoken");

const JWT_AUDIENCE = process.env.AUTH_JWT_AUDIENCE;
const JWT_SECRET = process.env.AUTH_JWT_SECRET;
const JWT_ISSUER = process.env.AUTH_JWT_ISSUER;
const JWT_EXPIRATION_INTERVAL = process.env.AUTH_JWT_EXPIRATIONINTERVAL;

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
const generateJWT = (user) => {
  const tokenData = {
    userId: user.id,
    roles: user.roles,
  };

  const signOptions = {
    expiresIn: Math.floor(JWT_EXPIRATION_INTERVAL / 1000),
    audience: JWT_AUDIENCE,
    issuer: JWT_ISSUER,
    subject: "auth",
  };

  return new Promise((resolve, reject) => {
    jwt.sign(tokenData, JWT_SECRET, signOptions, (err, token) => {
      if (err) {
        console.log("Error while signing new token:", err.message);
        return reject(err);
      }
      return resolve(token);
    });
  });
};

/**
 * Verify a given JWT for validity.
 *
 * @param authToken - The token to verify.
 *
 * @returns {Session} The decoded token if valid.
 */
const verifyJWT = (authToken) => {
  const verifyOptions = {
    audience: JWT_AUDIENCE,
    issuer: JWT_ISSUER,
    subject: "auth",
  };

  return new Promise((resolve, reject) => {
    jwt.verify(authToken, JWT_SECRET, verifyOptions, (err, decodedToken) => {
      if (err || !decodedToken) {
        console.log("Error while verifying token:", err.message);
        return reject(err || new Error("Token could not be parsed"));
      }
      return resolve(decodedToken);
    });
  });
};

module.exports = {
  generateJWT,
  verifyJWT,
};

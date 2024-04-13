// Based on: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Vocabulary_Cheat_Sheet.html

/**
 * Create a login success event.
 *
 * @param {number} userId - Id of the user.
 * @returns {string} event identifier
 */
const loginSuccess = (userId) => {
  userId = userId ?? -1;
  return `authn_login_success:${userId}`;
};

/**
 * Create a login success after fail event.
 *
 * @param {number} userId - Id of the user.
 * @param {number} retries - Number of retries.
 * @returns {string} event identifier
 */
const loginSuccessAfterFail = (userId, retries) => {
  return `authn_login_successafterfail:${userId},${retries}`;
};

/**
 * Create a login failed event.
 *
 * @param {number} userId - Id of the user.
 * @returns {string} event identifier
 */
const loginFailed = (userId) => {
  userId = userId ?? -1;
  return `authn_login_fail:${userId}`;
};

/**
 * Create an account lockout event.
 *
 * @param {number} userId - Id of the user.
 * @param {number} maxRetries - Maximum number of retries.
 * @returns {string} event identifier
 */
const loginLock = (userId, maxRetries) => {
  return `authn_login_lock:${userId},${maxRetries}`;
};

/**
 * Create a password change event.
 *
 * @param {number} userId - Id of the user.
 * @returns {string} event identifier
 */
const passwordChange = (userId) => {
  return `authn_password_change:${userId}`;
};

/**
 * Create a password change failed event.
 *
 * @param {number} userId - Id of the user.
 * @returns {string} event identifier
 */
const passwordChangeFailed = (userId) => {
  userId = userId ?? -1;
  return `authn_password_change_fail:${userId}`;
};

const authentication = {
  loginSuccess,
  loginSuccessAfterFail,
  loginFailed,
  loginLock,
  passwordChange,
  passwordChangeFailed,
};

/**
 * Create an authorization failed event.
 *
 * @param {number} userId - Id of the user.
 * @param {string} resource - The resource the user attempted to access.
 * @returns {string} event identifier
 */
const authorizationFailed = (userId, resource) => {
  return `authz_fail:${userId},${resource}`;
};

/**
 * Create a malicious CORS event.
 *
 * @param {string|number} ipOrUserId - IP address or id of the user.
 * @param {string} useragent - User agent.
 * @param {string} referrer - Referrer.
 * @returns {string} event identifier
 */
const maliciousCors = (ipOrUserId, useragent, referrer) => {
  return `malicious_cors:${ipOrUserId},${useragent},${referrer}`;
};

/**
 * Create a malicious 404 event.
 *
 * @param {string|number} ipOrUserId - IP address or id of the user.
 * @param {string} useragent - User agent.
 * @returns {string} event identifier
 */
const malicious404 = (ipOrUserId, useragent) => {
  return `malicious_404:${ipOrUserId},${useragent}`;
};

const malicious = {
  maliciousCors,
  malicious404,
};

/**
 * Create an input validation failed event.
 *
 * @param {string} field - The field that failed validation.
 * @param {number} userId - Id of the user.
 * @returns {string} event identifier
 */
const inputValidationFailed = (field, userId) => {
  userId = userId ?? -1;
  return `input_validation_fail:${field},${userId}`;
};

/**
 * Create a rate limit exceeded event.
 *
 * @param {number} userId - Id of the user.
 * @param {number} max - Maximum number of requests per second.
 * @returns
 */
const rateLimitExceeded = (userId, max) => {
  userId = userId ?? -1;
  return `excess_rate_limit_exceeded:${userId},${max}`;
};

module.exports = {
  authentication,
  malicious,
  authorizationFailed,
  inputValidationFailed,
  rateLimitExceeded,
};

// TODO: Add JSDoc.

// Authentication.
const loginSuccess = (userId) => {
  userId = userId ?? -1;
  return `authn_login_success:${userId}`;
};

const loginSuccessAfterFail = (userId, retries) => {
  return `authn_login_successafterfail:${userId},${retries}`;
};

const loginFailed = (userId) => {
  userId = userId ?? -1;
  return `authn_login_fail:${userId}`;
};

const loginLock = (userId, maxRetries) => {
  return `authn_login_lock:${userId},${maxRetries}`;
};

const passwordChange = (userId) => {
  return `authn_password_change:${userId}`;
};

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

// Authorization.
const authorizationFailed = (userId, resource) => {
  return `authz_fail:${userId},${resource}`;
};

const authorizationAdmin = (userId, event) => {
  return `authz_admin:${userId},${event}`;
};

const authorization = {
  authorizationFailed,
  authorizationAdmin,
};

// Malicious behavior.
const maliciousCors = (ipOrUserId, useragent, referrer) => {
  return `malicious_cors:${ipOrUserId},${useragent},${referrer}`;
};

const maliciousDirectReference = (ipOrUserId, useragent) => {
  return `malicious_direct:${ipOrUserId},${useragent}`;
};

const malicious = {
  maliciousCors,
  maliciousDirectReference,
};

// Input validation.
const inputValidationFailed = (field, userId) => {
  userId = userId ?? -1;
  return `input_validation_fail:${field},${userId}`;
};

// Rate limiting.
const rateLimitExceeded = (userId, max) => {
  return `excess_rate_limit_exceeded:${userId},${max}`;
};

module.exports = {
  authentication,
  authorization,
  malicious,
  inputValidationFailed,
  rateLimitExceeded,
};

/**

 *
 * authz_fail[:userid,resource] crit
 * authz_change[:userid,from,to] warn
 * authz_admin[:userid,event] warn
 *
 *
 * excess_rate_limit_exceeded[userid,max] warn
 *
 */

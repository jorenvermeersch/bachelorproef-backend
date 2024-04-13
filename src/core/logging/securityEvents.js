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

// Malicious behavior.
const maliciousCors = (ipOrUserId, useragent, referrer) => {
  return `malicious_cors:${ipOrUserId},${useragent},${referrer}`;
};

const malicious404 = (ipOrUserId, useragent) => {
  return `malicious_404:${ipOrUserId},${useragent}`;
};

const malicious = {
  maliciousCors,
  malicious404,
};

// Input validation.
const inputValidationFailed = (field, userId) => {
  userId = userId ?? -1;
  return `input_validation_fail:${field},${userId}`;
};

// Rate limiting.
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

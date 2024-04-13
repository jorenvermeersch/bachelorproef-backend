// Authentication.
const loginSuccess = (userId) => {
  return { event: `authn_login_success:${userId}` };
};

const loginSuccessAfterFail = (userId, retries) => {
  return { event: `authn_login_successafterfail:${userId},${retries}` };
};

const loginFailed = (userId) => {
  return { event: `authn_login_fail:${userId}` };
};

const loginFailedMax = (userId, maxLimit) => {
  return { event: `authn_login_fail_max:${userId},${maxLimit}` };
};

const passwordChange = (userId) => {
  return { event: `authn_password_change:${userId}` };
};

const passwordChangeFailed = (userId) => {
  return { event: `authn_password_change_fail:${userId}` };
};

const authentication = {
  loginSuccess,
  loginSuccessAfterFail,
  loginFailed,
  loginFailedMax,
  passwordChange,
  passwordChangeFailed,
};

// Authorization.
const authorizationFailed = (userId, resource) => {
  return { event: `authz_fail:${userId},${resource}` };
};

const authorizationAdmin = (userId, event) => {
  return { event: `authz_admin:${userId},${event}` };
};

const authorization = {
  authorizationFailed,
  authorizationAdmin,
};

// Input validation.
const inputValidationFailed = (field, userId) => {
  return { event: `input_validation_fail:${field},${userId}` };
};

const inputValidation = {
  inputValidationFailed,
};

module.exports = {
  authentication,
  authorization,
  inputValidation,
};

/**
 * authn_login_success[:userid] info
 * authn_login_successafterfail[:userid,retries] info
 * authn_login_fail[:userid] warn
 * authn_login_fail_max[:userid,maxlimit(int)] warn
 * authn_password_change[:userid] info
 * authn_password_change_fail[:userid] info
 *
 * authz_fail[:userid,resource] crit
 * authz_change[:userid,from,to] warn
 * authz_admin[:userid,event] warn
 *
 * input_validation_fail[:field,userid] warn
 *
 * excess_rate_limit_exceeded[userid,max] warn
 *
 */

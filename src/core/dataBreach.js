const { zxcvbnAsync, zxcvbnOptions } = require('@zxcvbn-ts/core');
const { matcherPwnedFactory } = require('@zxcvbn-ts/matcher-pwned');

const matcherPwned = matcherPwnedFactory(fetch, zxcvbnOptions);
zxcvbnOptions.addMatcher('pwned', matcherPwned);

const pwnedCode = 'pwned';

/**
 * Checks if a password has been breached against the Pnwed Passwords matcher of `zxcvbn-ts`.
 *
 * @param {*} password - The password to check.
 * @returns {Promise<boolean>} Returns `true` if the password has been breached, `false` otherwise.
 */
const isPasswordBreached = async (password) => {
  const result = await zxcvbnAsync(password);
  return result?.feedback?.warning === pwnedCode;
};

module.exports = { isPasswordBreached };

const { zxcvbnAsync, zxcvbnOptions } = require('@zxcvbn-ts/core');
const { matcherPwnedFactory } = require('@zxcvbn-ts/matcher-pwned');

const matcherPwned = matcherPwnedFactory(fetch, zxcvbnOptions);
zxcvbnOptions.addMatcher('pwned', matcherPwned);

const pwnedCode = 'pwned';

const isPasswordBreached = async (password) => {
  const result = await zxcvbnAsync(password);
  return result?.feedback?.warning === pwnedCode;
};

module.exports = { isPasswordBreached };

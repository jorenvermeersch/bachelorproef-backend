const config = require('config');
const argon2 = require('argon2');

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

module.exports = {
  hashPassword,
  verifyPassword,
};

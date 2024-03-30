const argon2 = require('argon2');
const config = require('config');

const ARGON_SALT_LENGTH = config.get('auth.argon.saltLength');
const ARGON_HASH_LENGTH = config.get('auth.argon.hashLength');
const ARGON_TIME_COST = config.get('auth.argon.timeCost');
const ARGON_MEMORY_COST = config.get('auth.argon.memoryCost');

/**
 * Hash the given secret.
 *
 * @param secret - The secret to hash.
 */
const hashSecret = async (secret) => {
  const secretHash = await argon2.hash(secret, {
    type: argon2.argon2id,
    saltLength: ARGON_SALT_LENGTH,
    hashLength: ARGON_HASH_LENGTH,
    timeCost: ARGON_TIME_COST,
    memoryCost: ARGON_MEMORY_COST,
  });

  return secretHash;
};

/**
 * Check if the given secret equals the hashed secret.
 *
 * @param secret - The secret to verify.
 * @param secretHash - The hashed secret.
 *
 * @returns {Promise<boolean>} Whether the secret is valid.
 */
const verifySecret = async (secret, secretHash) => {
  const valid = await argon2.verify(secretHash, secret, {
    type: argon2.argon2id,
    saltLength: ARGON_SALT_LENGTH,
    hashLength: ARGON_HASH_LENGTH,
    timeCost: ARGON_TIME_COST,
    memoryCost: ARGON_MEMORY_COST,
  });

  return valid;
};

module.exports = {
  hashSecret,
  verifySecret,
};

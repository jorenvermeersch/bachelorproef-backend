const Joi = require('joi');

const { isPasswordBreached } = require('../dataBreach');

const baseMessage =
  'The given password was exposed by a data breach on the Internet';

/**
 * Returns a Joi validation method which checks if the given password has been breached.
 *
 * @param {string} extendedMessage - Additional message to be appended to the error message.
 * @returns {Function} Joi validation method with signature `function(value, helpers)`.
 */
const verifySecretSafety =
  (extendedMessage = '') =>
  async (value, helpers) => {
    const isBreached = await isPasswordBreached(value);

    if (isBreached) {
      const error = helpers.error('password.breached');
      // helpers.message is currently not implemented: https://joi.dev/api/?v=17.12.2#validation-helpers
      error.message = `${baseMessage}. ${extendedMessage}`;

      return error;
    }
    return value;
  };

const passwordSchemaAsync = Joi.string()
  .min(12)
  .max(128)
  .external(verifySecretSafety());

module.exports = { passwordSchemaAsync, verifySecretSafety };

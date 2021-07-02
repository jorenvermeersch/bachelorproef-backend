const Joi = require('joi');

const ALLOWED_KEYS = ['body', 'params', 'query'];

const JOI_OPTIONS = {
  abortEarly: true, // stop when first error occured
  allowUnknown: false, // disallow unknown fields
  context: true, // give access to the Koa context (for Joi.ref, etc.)
  convert: true, // convert values to their types (number, Date, ...)
  presence: 'required', // default require all fields
};

const cleanupJoiError = (error) => error.details.reduce((resultObj, { message, path, type }) => {
  const joinedPath = path.join('.');
  if (!resultObj[joinedPath]) {
    resultObj[joinedPath] = [];
  }

  resultObj[joinedPath].push({
    type,
    message,
  });

  return resultObj;
}, {});

// Create our own validator function which only takes the schema as an argument
const validate = (schema) => {
  return (ctx, next) => {
    const errors = ALLOWED_KEYS.reduce((errors, key) => {
      if (key in schema) {
        const {
          error,
          value,
        } = schema[key].validate(ctx[key], JOI_OPTIONS);

        if (error) {
          errors[key] = cleanupJoiError(error);
        }

        ctx[key] = value;
      }

      return errors;
    }, {});

    if (Object.keys(errors).length) {
      ctx.throw(400, 'Validation failed, check details for more information', {
        code: 'VALIDATION_FAILED',
        details: errors,
      });
    }

    return next();
  };
};

/**
 * Validation scheme factory which gets the Joi instance
 * as a first argument.
 *
 * @param {Function} schemeGenerator - Function whichs creates the Joi-Scheme.
 */
const validationSchemeFactory = (schemeGenerator = () => {}) => {
  if (schemeGenerator === null) return {};

  const scheme = schemeGenerator(Joi);
  return ALLOWED_KEYS.reduce((newScheme, key) => {
    return {
      ...newScheme,
      [key]: Joi.isSchema(scheme[key]) ? scheme[key] : Joi.object(scheme[key] || {}),
    };
  }, {});
};

module.exports = {
  validationSchemeFactory,
  validate,
};

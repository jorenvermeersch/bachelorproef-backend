const Joi = require('joi');

const {
  inputValidation: { inputValidationFailed },
} = require('../logging/securityEvents');

const JOI_OPTIONS = {
  abortEarly: true, // stop when first error occured
  allowUnknown: false, // disallow unknown fields
  context: true, // give access to the Koa context (for Joi.ref, etc.)
  convert: true, // convert values to their types (number, Date, ...)
  presence: 'required', // default require all fields
};

const cleanupJoiError = (error) =>
  error.details.reduce((resultObj, { message, path, type }) => {
    const joinedPath = path.join('.') || 'value';
    if (!resultObj[joinedPath]) {
      resultObj[joinedPath] = [];
    }

    resultObj[joinedPath].push({
      type,
      message,
    });

    return resultObj;
  }, {});

const createLogInfo = (ctx, errors) => {
  const field = Object.keys(errors)[0];
  const userId = ctx.state?.session?.userId;
  const user = userId ? `User ${userId}` : 'unauthenticated user';

  return {
    description: `${user} submitted data that failed validation`,
    event: inputValidationFailed(field, userId),
    cause: errors[field][0].type ?? 'unknown',
  };
};

const REQUEST_PARTS = ['body', 'params', 'query'];

// Create our own validator function which only takes the schema as an argument.
const validate = (schema) => {
  // Be sure we have a schema that isn't null or undefined.
  if (!schema) {
    schema = {
      body: {},
      params: {},
      query: {},
    };
  }

  return (ctx, next) => {
    const errors = {};
    let logInfo = {};

    REQUEST_PARTS.forEach((part) => {
      if (schema[part]) {
        // Be sure the schema is a Joi instance
        if (!Joi.isSchema(schema[part])) {
          schema[part] = Joi.object(schema[part]);
        }

        const { error: partErrors, value: partValue } = schema[part].validate(
          part === 'body' ? ctx.request[part] : ctx[part],
          JOI_OPTIONS,
        );

        if (partErrors) {
          errors[part] = cleanupJoiError(partErrors);
          logInfo = createLogInfo(ctx, errors[part]);
        } else {
          part === 'body'
            ? (ctx.request[part] = partValue)
            : (ctx[part] = partValue);
        }
      }
    });

    if (Object.keys(errors).length) {
      ctx.throw(400, 'Validation failed, check details for more information', {
        code: 'VALIDATION_FAILED',
        details: errors,
        logInfo,
      });
    }

    return next();
  };
};

const validateAsync = (schema) => {
  if (!schema) {
    schema = {
      body: {},
      params: {},
      query: {},
    };
  }
  return async (ctx, next) => {
    const errors = {};
    let logInfo = {};

    for (const part of REQUEST_PARTS) {
      if (!Joi.isSchema(schema[part])) {
        schema[part] = Joi.object(schema[part]);
      }

      try {
        const partValue = await schema[part].validateAsync(
          part === 'body' ? ctx.request[part] : ctx[part],
          JOI_OPTIONS,
        );
        part === 'body'
          ? (ctx.request[part] = partValue)
          : (ctx[part] = partValue);
      } catch (partErrors) {
        errors[part] = cleanupJoiError(partErrors);
        logInfo = createLogInfo(ctx, errors[part]);
      }
    }

    if (Object.keys(errors).length) {
      ctx.throw(400, 'Validation failed, check details for more information', {
        code: 'VALIDATION_FAILED',
        details: errors,
        logInfo,
      });
    }

    return next();
  };
};

module.exports = { validate, validateAsync };

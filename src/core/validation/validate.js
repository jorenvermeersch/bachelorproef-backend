const Joi = require('joi');

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

// Create our own validator function which only takes the schema as an argument
const validate = (schema) => {
  // Be sure we have a schema that isn't null or undefined
  if (!schema) {
    schema = {
      body: {},
      params: {},
      query: {},
    };
  }

  return (ctx, next) => {
    const errors = {};
    if (schema.body) {
      // Be sure the schema is a Joi instance
      if (!Joi.isSchema(schema.body)) {
        schema.body = Joi.object(schema.body);
      }

      const { error: bodyErrors, value: bodyValue } = schema.body.validate(
        ctx.request.body,
        JOI_OPTIONS,
      );

      if (bodyErrors) {
        errors.body = cleanupJoiError(bodyErrors);
      } else {
        ctx.request.body = bodyValue;
      }
    }

    if (schema.params) {
      // Be sure the schema is a Joi instance
      if (!Joi.isSchema(schema.params)) {
        schema.params = Joi.object(schema.params);
      }

      const { error: paramsErrors, value: paramsValue } =
        schema.params.validate(ctx.params, JOI_OPTIONS);

      if (paramsErrors) {
        errors.params = cleanupJoiError(paramsErrors);
      } else {
        ctx.params = paramsValue;
      }
    }

    if (schema.query) {
      // Be sure the schema is a Joi instance
      if (!Joi.isSchema(schema.query)) {
        schema.query = Joi.object(schema.query);
      }

      const { error: queryErrors, value: queryValue } = schema.query.validate(
        ctx.query,
        JOI_OPTIONS,
      );

      if (queryErrors) {
        errors.query = cleanupJoiError(queryErrors);
      } else {
        ctx.query = queryValue;
      }
    }

    if (Object.keys(errors).length) {
      ctx.throw(400, 'Validation failed, check details for more information', {
        code: 'VALIDATION_FAILED',
        details: errors,
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

    if (schema.body) {
      // Be sure the schema is a Joi instance.
      if (!Joi.isSchema(schema.body)) {
        schema.body = Joi.object(schema.body);
      }

      try {
        const bodyValue = await schema.body.validateAsync(
          ctx.request.body,
          JOI_OPTIONS,
        );
        ctx.request.body = bodyValue;
      } catch (bodyErrors) {
        errors.body = cleanupJoiError(bodyErrors);
      }
    }

    if (schema.params) {
      // Be sure the schema is a Joi instance.
      if (!Joi.isSchema(schema.params)) {
        schema.params = Joi.object(schema.params);
      }

      try {
        const paramsValue = await schema.params.validateAsync(
          ctx.params,
          JOI_OPTIONS,
        );
        ctx.params = paramsValue;
      } catch (paramsErrors) {
        errors.params = cleanupJoiError(paramsErrors);
      }
    }

    if (schema.query) {
      // Be sure the schema is a Joi instance.
      if (!Joi.isSchema(schema.query)) {
        schema.query = Joi.object(schema.query);
      }

      try {
        const queryValue = await schema.query.validateAsync(
          ctx.query,
          JOI_OPTIONS,
        );
        ctx.query = queryValue;
      } catch (queryErrors) {
        errors.query = cleanupJoiError(queryErrors);
      }
    }

    if (Object.keys(errors).length) {
      ctx.throw(400, 'Validation failed, check details for more information', {
        code: 'VALIDATION_FAILED',
        details: errors,
      });
    }

    return next();
  };
};

module.exports = { validate, validateAsync };

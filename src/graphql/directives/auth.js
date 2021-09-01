const { mapSchema, getDirective, MapperKind } = require('@graphql-tools/utils');
const { defaultFieldResolver } = require('graphql');
const { userService } = require('../../service');

/**
 * Create an authentication and authorization directive.
 *
 * @param {string} directiveName - Name of the directive to use in the schema.
 */
const authDirective = (
  directiveName,
) => ({
  // We only allow the directive on field definitions
  authDirectiveTypeDefs: `directive @${directiveName} on FIELD_DEFINITION`,

  // Create a transform function which add the directive behavior to the given schema
  authDirectiveTransformer: (schema) => mapSchema(schema, {
    // Only field definitions as stated before
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      // Get the directive from the current field, will be undefined if not used
      const authDirective = getDirective(schema, fieldConfig, directiveName)?.[0];

      if (authDirective) {
        // If the field has this directive, get its resolver (or the default if not existing)
        const { resolve = defaultFieldResolver } = fieldConfig;

        // Extend the resolver with our session parsing
        fieldConfig.resolve = async function (source, args, context, info) {
          // Remember: the context is identical to the Koa context
          const { authorization } = context.headers;

          const {
            authToken,
            ...session
          } = await userService.checkAndParseSession(authorization);

          // Save the decoded session data in the current context's state
          context.state.session = session;
          // Also save the JWT in case we e.g. need to perform a request in the name of the current user
          context.state.authToken = authToken;

          // Perform the original resolver (if everything went well)
          return resolve(source, args, context, info);
        };
        return fieldConfig;
      }
    },
  }),
});

module.exports = authDirective;

const config = require('config');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { ApolloServer } = require('apollo-server-koa');
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} = require('apollo-server-core');
const typeDefs = require('./types');
const resolvers = require('./resolvers');
const authDirective = require('./directives/auth');

const GRAPHQL_INTROSPECTION = config.get('graphql.introspection');
const GRAPHQL_PLAYGROUND = config.get('graphql.playground');

/**
 * Install an Apollo Server in the given Koa application.
 *
 * @param {Koa} app - The koa application.
 */
const installApolloServer = async (app) => {
  const { authDirectiveTypeDefs, authDirectiveTransformer } = authDirective('auth');

  let schema = makeExecutableSchema({
    typeDefs: [
      ...typeDefs,
      authDirectiveTypeDefs,
    ],
    resolvers,
  });
  schema = authDirectiveTransformer(schema);

  const server = new ApolloServer({
    schema,
    introspection: GRAPHQL_INTROSPECTION,
    // use the Koa context as GraphQL context
    context: ({ ctx }) => ctx,
    plugins: [
      // only serve the playground in development mode
      GRAPHQL_PLAYGROUND
        ? ApolloServerPluginLandingPageGraphQLPlayground()
        : ApolloServerPluginLandingPageDisabled(),
    ],
    formatError: (error) => {
      // If we got a ServiceError, format the error
      if (error.originalError && error.originalError.name === 'ServiceError') {
        return {
          ...error,
          message: error.originalError.message,
          extensions: {
            code: error.originalError.code,
            name: error.originalError.name,
            stacktrace: error.extensions?.exception?.stacktrace || error.originalError.stack,
            details: error.originalError.details,
          },
        };
      }
      // Otherwise, return the error as-is
      return error;
    },
  });
  await server.start();
  server.applyMiddleware({ app });
};

module.exports = installApolloServer;

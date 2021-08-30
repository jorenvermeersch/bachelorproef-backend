const config = require('config');
const { ApolloServer } = require('apollo-server-koa');
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} = require('apollo-server-core');
const typeDefs = require('./types');
const resolvers = require('./resolvers');

const GRAPHQL_INTROSPECTION = config.get('graphql.introspection');
const GRAPHQL_PLAYGROUND = config.get('graphql.playground');

/**
 * Install an Apollo Server in the given Koa application.
 *
 * @param {Koa} app - The koa application.
 */
const installApolloServer = async (app) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: GRAPHQL_INTROSPECTION,
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

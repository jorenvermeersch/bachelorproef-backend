const { gql } = require('apollo-server-core');

const healthTypeDefs = gql`
  type PingResponse {
    pong: Boolean!
  }

  type VersionResponse {
    env: String!
    version: String!
    name: String!
  }

  type Query {
    ping: PingResponse!
    version: VersionResponse!
  }
`;

module.exports = healthTypeDefs;

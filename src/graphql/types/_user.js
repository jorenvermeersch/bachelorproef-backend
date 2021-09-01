const config = require('config');
const { gql } = require('apollo-server-core');

const authTypeDefs = config.get('auth.disabled') ? '' : gql`
  type LoginResponse {
    token: String!
    user: User!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  extend type Mutation {
    login(input: LoginInput!): LoginResponse!
    register(input: RegisterInput!): LoginResponse!
  }
`;

const userTypeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type UserListResponse {
    data: [User!]!
    totalCount: Int!
    count: Int!
    offset: Int!
    limit: Int!
  }

  input UserInput {
    name: String!
    email: String!
  }

  extend type Query {
    users(offset: Int, limit: Int): UserListResponse! @auth
    user(id: String!): User! @auth
  }

  extend type Mutation {
    updateUser(id: ID!, input: UserInput!): User!
    deleteUser(id: ID!): SuccessResponse!
  }

  ${authTypeDefs}
`;

module.exports = userTypeDefs;

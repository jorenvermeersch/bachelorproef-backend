const { gql } = require('apollo-server-core');

const transactionTypeDefs = gql`
  type Transaction {
    id: ID!
    name: String!
    date: String!
    place: Place!
  }

  type TransactionListResponse {
    data: [Transaction!]!
    totalCount: Int!
    count: Int!
    offset: Int!
    limit: Int!
  }

  input TransactionInput {
    name: String!
    date: String!
    place: ID!
  }

  extend type Query {
    transactions(offset: Int, limit: Int): TransactionListResponse!
    transaction(id: String!): Transaction!
  }

  type Mutation {
    createTransaction(input: TransactionInput!): Transaction!
    updateTransaction(id: ID!, input: TransactionInput!): Transaction!
    deleteTransaction(id: ID!): SuccessResponse!
  }
`;

module.exports = transactionTypeDefs;

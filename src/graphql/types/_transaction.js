const { gql } = require('apollo-server-core');

const transactionTypeDefs = gql`
  type Transaction {
    id: ID!
    amount: Float!
    date: Date!
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
    amount: Float!
    date: Date!
    placeId: ID!
  }

  extend type Query {
    transactions(offset: Int, limit: Int): TransactionListResponse! @auth
    transaction(id: String!): Transaction! @auth
  }

  type Mutation {
    createTransaction(input: TransactionInput!): Transaction! @auth
    updateTransaction(id: ID!, input: TransactionInput!): Transaction! @auth
    deleteTransaction(id: ID!): SuccessResponse! @auth
  }
`;

module.exports = transactionTypeDefs;

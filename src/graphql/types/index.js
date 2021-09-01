const { gql } = require('apollo-server-core');
const healthTypeDefs = require('./_health');
const placeTypeDefs = require('./_place');
const transactionTypeDefs = require('./_transaction');
const userTypeDefs = require('./_user');

const rootTypeDefs = gql`
  type SuccessResponse {
    success: Boolean!
  }
`;

module.exports = [
  rootTypeDefs,
  healthTypeDefs,
  placeTypeDefs,
  transactionTypeDefs,
  userTypeDefs,
];

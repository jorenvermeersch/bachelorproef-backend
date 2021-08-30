const { gql } = require('apollo-server-core');
const healthTypeDefs = require('./_health');
const placeTypeDefs = require('./_place');

const rootTypeDefs = gql`
  type SuccessResponse {
    success: Boolean!
  }
`;

module.exports = [
  rootTypeDefs,
  healthTypeDefs,
  placeTypeDefs,
];

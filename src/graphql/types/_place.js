const { gql } = require('apollo-server-core');

const placeTypeDefs = gql`
  type Place {
    id: ID!
    name: String!
    rating: Int
  }

  type PlaceListResponse {
    data: [Place!]!
    totalCount: Int!
    count: Int!
    offset: Int!
    limit: Int!
  }

  input PlaceInput {
    name: String!
    rating: Int
  }

  extend type Query {
    places(offset: Int, limit: Int): PlaceListResponse! @auth
    place(id: String!): Place! @auth
  }

  type Mutation {
    createPlace(input: PlaceInput!): Place! @auth
    updatePlace(id: ID!, input: PlaceInput!): Place! @auth
    deletePlace(id: ID!): SuccessResponse! @auth
  }
`;

module.exports = placeTypeDefs;

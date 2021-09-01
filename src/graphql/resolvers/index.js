const { dateResolver } = require('../scalars/date');
const healthResolvers = require('./_health');
const placeResolvers = require('./_place');
const transactionResolvers = require('./_transaction');
const userResolvers = require('./_user');

module.exports = [
  dateResolver,
  healthResolvers,
  placeResolvers,
  transactionResolvers,
  userResolvers,
];

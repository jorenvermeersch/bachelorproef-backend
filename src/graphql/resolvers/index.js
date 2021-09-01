const healthResolvers = require('./_health');
const placeResolvers = require('./_place');
const transactionResolvers = require('./_transaction');
const userResolvers = require('./_user');

module.exports = [
  healthResolvers,
  placeResolvers,
  transactionResolvers,
  userResolvers,
];

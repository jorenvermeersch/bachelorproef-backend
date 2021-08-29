const { healthService } = require('../../service');

const healthResolvers = {
  Query: {
    ping: () => healthService.ping(),
    version: () => healthService.getVersion(),
  },
};

module.exports = healthResolvers;

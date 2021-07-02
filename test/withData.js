const config = require('config');
const { initializeData, shutdownData } = require('../src/data');
const { initializeLogging } = require('../src/core/logging');

const withData = () => {
  beforeAll(async () => {
    // Create a database connection
    initializeLogging({
      level: config.get('log.level'),
      disabled: config.get('log.disabled'),
    });
    await initializeData();
  });

  afterAll(async () => {
    await shutdownData();
  });
};

module.exports = withData;

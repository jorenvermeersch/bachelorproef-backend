const config = require('config');

const { users } = require('./constants');
const { insertUsers } = require('./helpers/users');
const { initializeLogging } = require('../src/core/logging/logger');
const { initializeData } = require('../src/data');

module.exports = async () => {
  // Create a database connection.
  const level = config.get('log.level');
  const disabled = config.get('log.disabled');

  initializeLogging(level, disabled);

  await initializeData();

  // Insert an admin and regular test user.
  const { admin: adminUser, test: testUser } = users;
  await insertUsers([testUser, adminUser]);
};

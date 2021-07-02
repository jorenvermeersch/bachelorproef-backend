const config = require('config');
const { initializeData, getKnex, tables } = require('../src/data');
const { initializeLogging } = require('../src/core/logging');

module.exports = async () => {
  // Create a database connection
  initializeLogging({
    level: config.get('log.level'),
    disabled: config.get('log.disabled'),
  });
  await initializeData();

  // Insert a test user with password 12345678
  const knex = getKnex();

  await knex(tables.user).insert([{
    id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
    first_name: 'Test',
    last_name: 'User',
    email: 'test.user@hogent.be',
    password_hash:
      '$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4',
    roles: JSON.stringify(['user']),
  }]);
};

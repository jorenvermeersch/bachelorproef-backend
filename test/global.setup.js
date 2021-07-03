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
      '$argon2id$v=19$m=2048,t=2,p=1$NF6PFLTgSYpDSex0iFeFQQ$Rz5ouoM9q3EH40hrq67BC3Ajsu/ohaHnkKBLunELLzU',
    roles: JSON.stringify(['user']),
  }]);
};
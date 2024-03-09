const config = require('config');

const { passwords, users } = require('./config');
const { initializeLogging } = require('../src/core/logging');
const { hashPassword } = require('../src/core/password');
const Role = require('../src/core/roles');
const { initializeData, getKnex, tables } = require('../src/data');

module.exports = async () => {
  // Create a database connection.
  const level = config.get('log.level');
  const disabled = config.get('log.disabled');

  initializeLogging(level, disabled);

  await initializeData();

  // Insert an admin and regular test user.
  const knex = getKnex();

  const passwordHash = await hashPassword(passwords.valid);
  const { admin: adminUser, test: testUser } = users;

  await knex(tables.user).insert([
    {
      id: testUser.id,
      name: testUser.name,
      email: testUser.email,
      password_hash: passwordHash,
      roles: JSON.stringify([Role.USER]),
    },
    {
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      password_hash: passwordHash,
      roles: JSON.stringify([Role.ADMIN, Role.USER]),
    },
  ]);
};

const { hashSecret } = require('../../src/core/hashing');
const Role = require('../../src/core/roles');
const { getKnex, tables } = require('../../src/data');
const { passwords } = require('../constants');

/**
 * Inserts a record in the `users` and `user_lockouts` tables for each user in the `users` array.
 * If no values are provided for `password_hash` and `roles`, default values are used:
 * - `password_hash` is the hash of `passwords.valid`.
 * - `roles` is an array with the `Role.USER` role.
 *
 * @param {Array<object>} users - The users to insert.
 */
const insertUsers = async (users) => {
  if (!(users instanceof Array)) {
    users = [users];
  }

  const passwordHash = await hashSecret(passwords.valid);
  const userRole = JSON.stringify([Role.USER]);

  users = users.map(({ id, name, email, password_hash, roles }) => ({
    id,
    name,
    email,
    password_hash: password_hash ?? passwordHash,
    roles: roles ?? userRole,
  }));

  const knex = getKnex();

  await knex(tables.user).insert(users);

  await knex(tables.userLockout).insert(
    users.map(({ id }) => ({
      id: id,
      user_id: id,
      failed_login_attempts: 0,
      end_time: null,
    })),
  );
};

/**
 * Deletes the users from the `users` and `user_lockouts` tables.
 *
 * @param {Array<number>} userIds - The id's of the users to delete.
 */
const deleteUsers = async (userIds) => {
  const knex = getKnex();

  await knex(tables.userLockout).whereIn('user_id', userIds).delete();
  await knex(tables.user).whereIn('id', userIds).delete();
};

module.exports = { insertUsers, deleteUsers };

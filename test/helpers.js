const { passwords } = require('./constants');
const { hashSecret } = require('../src/core/hashing');
const Role = require('../src/core/roles');
const { getKnex, tables } = require('../src/data');

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

// TODO: Add documentation.
const deleteUsers = async (userIds) => {
  const knex = getKnex();

  await knex(tables.userLockout).whereIn('user_id', userIds).delete();
  await knex(tables.user).whereIn('id', userIds).delete();
};

const requestReset = async (email, supertest) => {
  const response = await supertest.post('/api/password/request-reset').send({
    email: email,
  });

  return response;
};

// TODO: Add documentation.
const parseResetEmail = (email) => {
  if (!email) {
    throw new Error('Email is required.');
  }

  const { text, to } = email;

  // The origin is undefined when testing, so you can't use `text` to create an URL.
  const params = new URLSearchParams(text.split('/')[1]);
  const token = params.get('token');

  return { token, email: to };
};

module.exports = { insertUsers, deleteUsers, requestReset, parseResetEmail };

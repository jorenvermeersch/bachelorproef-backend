const { getKnex, tables } = require('../src/data');

const insertUsers = async (users) => {
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

const deleteUsers = async (userIds) => {
  const knex = getKnex();

  await knex(tables.userLockout).whereIn('user_id', userIds).delete();
  await knex(tables.user).whereIn('id', userIds).delete();
};

module.exports = { insertUsers, deleteUsers };

const { tables } = require('..');

module.exports = {
  seed: async (knex) => {
    // first delete all entries
    await knex(tables.user).delete();

    // then add the fresh users
    await knex(tables.user).insert([
      { id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80', name: 'Thomas' },
      { id: '7f28c5f9-d711-4cd6-ac15-d13d71abff81', name: 'Pieter' },
      { id: '7f28c5f9-d711-4cd6-ac15-d13d71abff82', name: 'Karine' },
    ]);
  },
};

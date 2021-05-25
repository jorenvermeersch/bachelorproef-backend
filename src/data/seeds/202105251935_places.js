const { tables } = require('..');

module.exports = {
  seed: async (knex) => {
    // first delete all entries
    await knex(tables.place).delete();

    // then add the fresh users
    await knex(tables.place).insert([
      { id: '7f28c5f9-d711-4cd6-ac15-d13d71abff83', name: 'Loon' },
      { id: '7f28c5f9-d711-4cd6-ac15-d13d71abff84', name: 'Dranken Geers' },
      { id: '7f28c5f9-d711-4cd6-ac15-d13d71abff85', name: 'Irish Pub' },
    ]);
  },
};

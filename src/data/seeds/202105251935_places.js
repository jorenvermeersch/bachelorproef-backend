const { tables } = require('..');

module.exports = {
  seed: async (knex) => {
    // first delete all entries
    await knex(tables.place).delete();

    // then add the fresh users
    await knex(tables.place).insert([
      { id: '7f28c5f9-d711-4cd6-ac15-d13d71abff83', name: 'Loon', rating: 5 },
      { id: '7f28c5f9-d711-4cd6-ac15-d13d71abff84', name: 'Dranken Geers', rating: 3 },
      { id: '7f28c5f9-d711-4cd6-ac15-d13d71abff85', name: 'Irish Pub', rating: 4 },
    ]);
  },
};

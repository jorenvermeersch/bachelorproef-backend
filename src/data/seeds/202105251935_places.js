const { tables } = require('..');

module.exports = {
  seed: async (knex) => {
    await knex(tables.place).insert([
      { id: 1, name: 'Loon', rating: 5 },
      { id: 2, name: 'Dranken Geers', rating: 3 },
      { id: 3, name: 'Irish Pub', rating: 4 },
    ]);
  },
};

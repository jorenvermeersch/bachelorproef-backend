const { tables } = require('..');

module.exports = {
  up: async (knex) => {
    await knex.schema.alterTable(tables.place, (table) => {
      table.integer('rating')
        .nullable();
    });
  },
  down: (knex) => {
    return knex.schema.alterTable(tables.place, (table) => {
      table.dropColumn('rating');
    });
  },
};

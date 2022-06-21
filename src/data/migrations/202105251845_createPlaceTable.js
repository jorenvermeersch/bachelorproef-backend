const { tables } = require('..');

module.exports = {
  up: async (knex) => {
    await knex.schema.createTable(tables.place, (table) => {
      table.increments('id');

      table.string('name', 255)
        .notNullable();

      // Give this unique index a name for better error handling in service layer
      table.unique('name', 'idx_place_name_unique');
    });
  },
  down: (knex) => {
    return knex.schema.dropTableIfExists(tables.place);
  },
};

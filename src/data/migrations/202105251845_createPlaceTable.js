const { tables } = require('..');
const { createIdGenerationTrigger } = require('../_migrations.helpers');

module.exports = {
  up: async (knex) => {
    await knex.schema.createTable(tables.place, (table) => {
      table.uuid('id')
        .primary();

      table.string('name', 255)
        .notNullable();

      // Give this unique index a name for better error handling in service layer
      table.unique('name', 'idx_place_name_unique');
    });

    // Create a trigger to set the UUID for the column id as MySQL does
    // not support functions as default values
    await knex.schema.raw(createIdGenerationTrigger(tables.place));
  },
  down: (knex) => {
    return knex.schema.dropTableIfExists(tables.place);
  },
};

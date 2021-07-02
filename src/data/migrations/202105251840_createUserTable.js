const { tables } = require('..');
const { createIdGenerationTrigger } = require('../_migrations.helpers');

module.exports = {
  up: async (knex) => {
    await knex.schema.createTable(tables.user, (table) => {
      table.uuid('id')
        .primary();

      table.string('first_name', 255)
        .notNullable();

      table.string('last_name', 255)
        .notNullable();
    });

    // Create a trigger to set the UUID for the column id as MySQL does
    // not support functions as default values
    await knex.schema.raw(createIdGenerationTrigger(tables.user));
  },
  down: (knex) => {
    return knex.schema.dropTableIfExists(tables.user);
  },
};

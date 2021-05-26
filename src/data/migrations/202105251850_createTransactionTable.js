const { tables } = require('..');
const { createIdGenerationTrigger } = require('../_migrations.helpers');

module.exports = {
  up: async (knex) => {
    await knex.schema.createTable(tables.transaction, (table) => {
      table.uuid('id')
        .primary();

      table.integer('amount')
        .notNullable();

      table.dateTime('date')
        .notNullable();

      table.uuid('user_id')
        .notNullable();
      table.foreign('user_id')
        .references(`${tables.user}.id`)
        .onDelete('CASCADE');

      table.uuid('place_id')
        .notNullable();
      table.foreign('place_id')
        .references(`${tables.place}.id`)
        .onDelete('CASCADE');
    });

    // Create a trigger to set the UUID for the column id as MySQL does
    // not support functions as default values
    await knex.schema.raw(createIdGenerationTrigger(tables.transaction));
  },
  down: (knex) => {
    return knex.schema.dropTableIfExists(tables.transaction);
  },
};

const { tables } = require('..');

module.exports = {
  up: (knex) => {
    return knex.schema.createTable(tables.place, (table) => {
      table.uuid('id')
        .primary()
        .defaultTo(knex.raw('(UUID())'));

      table.string('name', 255)
        .notNullable();
    });
  },
  down: (knex) => {
    return knex.schema.dropTableIfExists(tables.place);
  },
};

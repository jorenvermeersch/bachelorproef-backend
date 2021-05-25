const { tables } = require('..');

module.exports = {
  up: (knex) => {
    return knex.schema.createTable(tables.transaction, (table) => {
      table.uuid('id')
        .primary()
        .defaultTo(knex.raw('(UUID())'));

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
  },
  down: (knex) => {
    return knex.schema.dropTableIfExists(tables.transaction);
  },
};

const { tables } = require('..');

module.exports = {
  up: async (knex) => {
    await knex.schema.createTable(tables.transaction, (table) => {
      table.increments('id');

      table.integer('amount')
        .notNullable();

      table.dateTime('date')
        .notNullable();

      table.integer('user_id')
        .unsigned()
        .notNullable();

      // Give this foreign key a name for better error handling in service layer
      table.foreign('user_id', 'fk_transaction_user')
        .references('id')
        .inTable(tables.user)
        .onDelete('CASCADE');

      table.integer('place_id')
        .unsigned()
        .notNullable();

      // Give this foreign key a name for better error handling in service layer
      table.foreign('place_id', 'fk_transaction_place')
        .references('id')
        .inTable(tables.place)
        .onDelete('CASCADE');
    });
  },
  down: (knex) => {
    return knex.schema.dropTableIfExists(tables.transaction);
  },
};

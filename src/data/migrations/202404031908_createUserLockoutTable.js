const { tables } = require('..');

module.exports = {
  up: async (knex) => {
    await knex.schema.createTable(tables.userLockout, (table) => {
      table.increments('id');
      table.integer('user_id').unsigned().notNullable();
      table.integer('failed_login_attempts').notNullable().defaultTo(0);
      table.dateTime('lockout_end_time');

      // Foreign key.
      table
        .foreign('user_id', 'fk_user_lockout_user')
        .references('id')
        .inTable(tables.user);
    });
  },
  down: (knex) => {
    return knex.schema.dropTableIfExists(tables.userLockout);
  },
};

const { tables } = require('..');

const uuidv4Length = 36;

module.exports = {
  up: async (knex) => {
    await knex.schema.createTable(tables.password_reset_token, (table) => {
      table.integer('user_id').unsigned().notNullable();
      table.string('token', uuidv4Length).notNullable();
      table.datetime('token_expiry').notNullable(); // Knex documentation: MySQL and MSSQL do not have useTz option.

      // Foreign key.
      table
        .foreign('user_id', 'fk_password_reset_token_user')
        .references('id')
        .inTable(tables.user);

      // Primary key.
      table.primary(['user_id', 'token']);
    });
  },
  down: (knex) => {
    return knex.schema.dropTableIfExists(tables.password_reset_token);
  },
};

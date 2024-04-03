const { addMinutes } = require('date-fns');

const { tables } = require('..');

module.exports = {
  seed: async (knex) => {
    await knex(tables.userLockout).insert([
      {
        id: 1,
        user_id: 1,
        failed_login_attempts: 0,
        end_time: null,
      },
      {
        id: 2,
        user_id: 2,
        failed_login_attempts: 0,
        end_time: null,
      },
      {
        id: 3,
        user_id: 3,
        failed_login_attempts: 4,
        end_time: null,
      },
      {
        id: 4,
        user_id: 4,
        failed_login_attempts: 5,
        end_time: addMinutes(new Date(), 5),
      },
    ]);
  },
};

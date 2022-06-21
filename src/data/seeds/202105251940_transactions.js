const { tables } = require('..');

module.exports = {
  seed: async (knex) => {
    // first delete all entries
    await knex(tables.transaction).delete();

    // then add the fresh users
    await knex(tables.transaction).insert([
      { // User Thomas
        id: 1,
        user_id: 1,
        place_id: 1,
        amount: 3500,
        date: new Date(2021, 4, 25, 19, 40),
      },
      {
        id: 2,
        user_id: 1,
        place_id: 2,
        amount: -220,
        date: new Date(2021, 4, 8, 20, 0),
      },
      {
        id: 3,
        user_id: 1,
        place_id: 3,
        amount: -74,
        date: new Date(2021, 4, 21, 14, 30),
      },
      { // User Pieter
        id: 4,
        user_id: 2,
        place_id: 1,
        amount: 4000,
        date: new Date(2021, 4, 25, 19, 40),
      },
      {
        id: 5,
        user_id: 2,
        place_id: 2,
        amount: -220,
        date: new Date(2021, 4, 9, 23, 0),
      },
      {
        id: 6,
        user_id: 2,
        place_id: 3,
        amount: -74,
        date: new Date(2021, 4, 22, 12, 0),
      },
      { // User Karine
        id: 7,
        user_id: 3,
        place_id: 1,
        amount: 4000,
        date: new Date(2021, 4, 25, 19, 40),
      },
      {
        id: 8,
        user_id: 3,
        place_id: 2,
        amount: -220,
        date: new Date(2021, 4, 10, 10, 0),
      },
      {
        id: 9,
        user_id: 3,
        place_id: 3,
        amount: -74,
        date: new Date(2021, 4, 19, 11, 30),
      },
    ]);
  },
};

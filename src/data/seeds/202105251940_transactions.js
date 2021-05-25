const { tables } = require('..');

module.exports = {
  seed: async (knex) => {
    // first delete all entries
    await knex(tables.transaction).delete();

    // then add the fresh users
    await knex(tables.transaction).insert([
      { // User Thomas
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff86',
        user_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
        place_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff83',
        amount: 3500,
        date: new Date(2021, 4, 25, 19, 40),
      },
      {
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff87',
        user_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
        place_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff84',
        amount: -220,
        date: new Date(2021, 4, 8, 20, 0),
      },
      {
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff88',
        user_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
        place_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff85',
        amount: -74,
        date: new Date(2021, 4, 21, 14, 30),
      },
      { // User Pieter
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff89',
        user_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff81',
        place_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff83',
        amount: 4000,
        date: new Date(2021, 4, 25, 19, 40),
      },
      {
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff8a',
        user_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff81',
        place_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff84',
        amount: -220,
        date: new Date(2021, 4, 9, 23, 0),
      },
      {
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff8b',
        user_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff81',
        place_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff85',
        amount: -74,
        date: new Date(2021, 4, 22, 12, 0),
      },
      { // User Karine
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff8c',
        user_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff82',
        place_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff83',
        amount: 4000,
        date: new Date(2021, 4, 25, 19, 40),
      },
      {
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff8d',
        user_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff82',
        place_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff84',
        amount: -220,
        date: new Date(2021, 4, 10, 10, 0),
      },
      {
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff8e',
        user_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff82',
        place_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff85',
        amount: -74,
        date: new Date(2021, 4, 19, 11, 30),
      },
    ]);
  },
};

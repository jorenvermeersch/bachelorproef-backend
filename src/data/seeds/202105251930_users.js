const { tables } = require('..');

module.exports = {
  seed: async (knex) => {
    // first delete all entries
    await knex(tables.user).delete();

    // then add the fresh users (all passwords are 12345678)
    await knex(tables.user).insert([
      {
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
        name: 'Thomas',
        email: 'thomas.aelbrecht@hogent.be',
        password_hash:
        '$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4',
        roles: JSON.stringify(['user']),
      },
      {
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff81',
        name: 'Pieter',
        email: 'pieter.vanderhelst@hogent.be',
        password_hash:
        '$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4',
        roles: JSON.stringify(['user']),
      },
      {
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff82',
        name: 'Karine',
        email: 'karine.samyn@hogent.be',
        password_hash:
        '$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4',
        roles: JSON.stringify(['user']),
      },
    ]);
  },
};

const { tables } = require('..');
const { hashSecret } = require('../../core/hashing');
const Role = require('../../core/roles');

module.exports = {
  seed: async (knex) => {
    const validPassword = await hashSecret('toegepaste_informatica');
    const tooShort = await hashSecret('zwak');

    await knex(tables.user).insert([
      {
        id: 1,
        name: 'Thomas Aelbrecht',
        email: 'thomas.aelbrecht@hogent.be',
        password_hash: validPassword,
        roles: JSON.stringify([Role.ADMIN, Role.USER]),
      },
      {
        id: 2,
        name: 'Pieter Van Der Helst',
        email: 'pieter.vanderhelst@hogent.be',
        password_hash: validPassword,
        roles: JSON.stringify([Role.USER]),
      },
      {
        id: 3,
        name: 'Karine Samyn',
        email: 'karine.samyn@hogent.be',
        password_hash: validPassword,
        roles: JSON.stringify([Role.USER]),
      },
      {
        id: 4,
        name: 'Joren Vermeersch',
        email: 'joren.vermeersch@student.hogent.be',
        password_hash: tooShort,
        roles: JSON.stringify([Role.USER, Role.ADMIN]),
      },
    ]);
  },
};

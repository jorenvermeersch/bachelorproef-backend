const Role = require('../src/core/roles');

const passwords = {
  tooLong: 'a'.repeat(256),
  tooShort: 'a',
  valid: 'hogent_toegepaste_informatica',
  invalid: 'invalid-password-r"Q[`?jZxkG8s7A#9]M6tc',
  new: 'h0gent_toegep@ste_informat1ca_2',
  breached: 'password1234',
};

const tokens = {
  validFormatButIncorrect: '51bc6ebc-6f85-4d33-8576-20c1fbb5d66b',
  tooLong: '51bc6ebc-6f85-4d33-8576-20c1fbb5d66ba',
  tooShort: '51bc6ebc-6f85-4d33-8576-20c1fbb5d66',
};

const users = {
  test: {
    id: 1,
    name: 'Test User',
    email: 'test.user@hogent.be',
  },
  admin: {
    id: 2,
    name: 'Admin User',
    email: 'admin.user@hogent.be',
    roles: JSON.stringify([Role.ADMIN, Role.USER]),
  },
  passwordReset: {
    id: 4,
    name: 'Password Reset User',
    email: 'reset.user@hogent.be',
  },
};

module.exports = { users, passwords, tokens };

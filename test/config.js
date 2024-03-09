const passwords = {
  tooLong: 'a'.repeat(256),
  tooShort: 'a',
  valid: 'hogent_toegepaste_informatica',
};

const users = {
  test: {
    id: 1,
    name: 'Test User',
    email: 'test.user@hogent.be',
    password: passwords.valid,
  },
  admin: {
    id: 2,
    name: 'Admin User',
    email: 'admin.user@hogent.be',
    password: passwords.valid,
  },
  login: {
    id: 3,
    name: 'Login User',
    email: 'login@hogent.be',
    password: passwords.valid,
  },
};

module.exports = { users, passwords };

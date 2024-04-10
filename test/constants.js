const passwords = {
  tooLong: 'a'.repeat(256),
  tooShort: 'a',
  valid: 'hogent_toegepaste_informatica',
  newValid: 'h0gent_toegep@ste_informat1ca_2',
  breached: 'password1234',
  invalid: 'invalid-password-r"Q[`?jZxkG8s7A#9]M6tc',
};

const tokens = {
  validFormat: '51bc6ebc-6f85-4d33-8576-20c1fbb5d66b',
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
  passwordReset: {
    id: 4,
    name: 'Password Reset User',
    email: 'reset.user@hogent.be',
  },
};

module.exports = { users, passwords, tokens };

const { mock } = require('nodemailer');

const { tables } = require('../../src/data');
const {
  users: { test: testUser, passwordReset: resetUser },
  passwords,
  tokens,
} = require('../constants');
const { requestReset, parseResetEmail } = require('../helpers/passwords');
const { insertUsers, deleteUsers } = require('../helpers/users');
const { withServer } = require('../supertest.setup');

// Nodemailer is automatically mocked with nodemailer-mock in ./__mocks__/nodemailer.js

describe('Passwords', () => {
  let supertest, knex;

  withServer(({ supertest: s, knex: k }) => {
    supertest = s;
    knex = k;
  });

  describe('POST /api/password/request-reset', () => {
    const url = '/api/password/request-reset';

    afterEach(async () => {
      mock.reset();
    });

    afterAll(async () => {
      await knex(tables.passwordResetRequest).del();
    });

    it('should 202 and send password reset email for existing user', async () => {
      const response = await supertest.post(url).send({
        email: testUser.email,
      });

      const resetMail = mock.getSentMail()[0];

      expect(response.status).toBe(202);
      expect(resetMail.to).toBe(testUser.email);
    });

    it('should 202 and not send password reset email for unknown user', async () => {
      const response = await supertest.post(url).send({
        email: 'unknown.user@hogent.be',
      });

      const resetMails = mock.getSentMail();

      expect(response.status).toBe(202);
      expect(resetMails).toHaveLength(0);
    });
  });

  describe('POST /api/password/reset', () => {
    const url = '/api/password/reset';

    beforeAll(async () => {
      await insertUsers({
        ...resetUser,
      });
    });

    afterAll(async () => {
      await deleteUsers([resetUser.id]);
    });

    afterEach(async () => {
      await knex(tables.passwordResetRequest).del();
    });

    it('should 204 and reset the password', async () => {
      await requestReset(resetUser.email, supertest);

      const resetMail = mock.getSentMail()[0];
      const { token } = parseResetEmail(resetMail);

      const response = await supertest.post(url).send({
        email: resetUser.email,
        token,
        newPassword: passwords.newValid,
      });

      expect(response.status).toBe(204);
    });

    it('should 400 for missing fields', async () => {
      // TODO!
    });

    it('should 400 for invalid fields', async () => {
      // TODO!
    });

    it('should 400 for unknown user', async () => {
      const response = await supertest.post(url).send({
        email: 'unknown.user@hogent.be',
        token: tokens.validFormat,
        newPassword: passwords.valid,
      });

      expect(response.status).toBe(400);
    });

    it('should 400 for existing user without a reset request', async () => {
      const response = await supertest.post(url).send({
        email: resetUser.email,
        token: tokens.validFormat,
        newPassword: passwords.newValid,
      });

      expect(response.status).toBe(400);
    });

    it('should 400 for invalid reset token', async () => {
      await requestReset(resetUser.email, supertest);

      const response = await supertest.post(url).send({
        email: resetUser.email,
        token: tokens.validFormat,
        newPassword: passwords.newValid,
      });

      expect(response.status).toBe(400);
    });

    it('should 400 for expired reset token', async () => {
      // TODO!
    });

    it('should 400 when using a old reset token after requesting a new one', async () => {
      await requestReset(resetUser.email, supertest);

      const resetMail = mock.getSentMail()[0];
      const { token: oldToken } = parseResetEmail(resetMail);

      await requestReset(resetUser.email, supertest);

      const response = await supertest.post(url).send({
        email: resetUser.email,
        token: oldToken,
        newPassword: passwords.newValid,
      });

      expect(response.status).toBe(400);
    });

    it('should 400 when using the same reset token twice', async () => {
      // TODO!
    });
  });
});

const { mock } = require('nodemailer');

const {
  users: { test: testUser },
} = require('../constants');
const { withServer } = require('../supertest.setup');

// Nodemailer is automatically mocked with nodemailer-mock in ./__mocks__/nodemailer.js

describe('Passwords', () => {
  let supertest;

  withServer(({ supertest: s }) => {
    supertest = s;
  });

  describe('POST /api/password/request-reset', () => {
    const url = '/api/password/request-reset';

    afterEach(async () => {
      mock.reset();
    });

    afterAll(async () => {
      // Delete all reset requests from test database.
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
    it('should 204 and reset the password', async () => {
      throw new Error('Not implemented');
    });

    it('should 400 for missing fields', async () => {
      throw new Error('Not implemented');
    });

    it('should 400 for invalid fields', async () => {
      throw new Error('Not implemented');
    });

    it('should 400 for unknown user', async () => {
      throw new Error('Not implemented');
    });

    it('should 400 for existing user without a reset request', async () => {
      throw new Error('Not implemented');
    });

    it('should 400 for invalid reset token', async () => {
      throw new Error('Not implemented');
    });

    it('should 400 for expired reset token', async () => {
      throw new Error('Not implemented');
    });

    it('should 400 when using a old reset token after requesting a new one', async () => {
      throw new Error('Not implemented');
    });

    it('should 400 when using the same reset token twice', async () => {
      throw new Error('Not implemented');
    });
  });
});

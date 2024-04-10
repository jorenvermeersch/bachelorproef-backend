const config = require('config');
const { subMinutes, addDays } = require('date-fns');

const { hashSecret } = require('../../src/core/hashing');
const Role = require('../../src/core/roles');
const { tables } = require('../../src/data');
const { testAuthHeader } = require('../common/auth');
const {
  users: { login: loginUser },
  passwords,
} = require('../constants');
const { insertUsers, deleteUsers } = require('../helpers');
const { withServer, login, loginAdmin } = require('../supertest.setup');

const MAX_FAILED_LOGIN_ATTEMPTS = config.get('auth.maxFailedAttempts');

describe('Users', () => {
  let supertest, knex, authHeader, adminAuthHeader, passwordHash;

  withServer(({ supertest: s, knex: k }) => {
    supertest = s;
    knex = k;
  });

  beforeAll(async () => {
    authHeader = await login(supertest);
    adminAuthHeader = await loginAdmin(supertest);
    passwordHash = await hashSecret(passwords.valid);
  });

  describe('POST /api/users/login', () => {
    const url = '/api/users/login';

    beforeAll(async () => {
      await insertUsers({
        id: loginUser.id,
        name: loginUser.name,
        email: loginUser.email,
      });
    });

    afterAll(async () => {
      // Remove the created user.
      await deleteUsers([loginUser.id]);
    });

    it('should 200 and return user and token when succesfully logged in', async () => {
      const response = await supertest.post(url).send({
        email: loginUser.email,
        password: loginUser.password,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.user).toEqual({
        id: loginUser.id,
        name: loginUser.name,
        email: loginUser.email,
      });
    });

    it('should 401 with wrong email', async () => {
      const response = await supertest.post(url).send({
        email: 'invalid@hogent.be',
        password: loginUser.password,
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'The given email and password do not match',
        details: {},
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 401 with wrong password', async () => {
      const response = await supertest.post(url).send({
        email: loginUser.email,
        password: passwords.invalid,
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'The given email and password do not match',
        details: {},
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 with invalid email', async () => {
      const response = await supertest.post(url).send({
        email: 'invalid',
        password: loginUser.password,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('email');
    });

    it('should 400 when no password given', async () => {
      const response = await supertest.post(url).send({
        email: loginUser.email,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('password');
    });

    it('should 400 when no email given', async () => {
      const response = await supertest.post(url).send({
        password: loginUser.password,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('email');
    });

    describe('account lockout', () => {
      beforeAll(async () => {
        await knex(tables.user).insert([
          {
            id: 7,
            name: 'No Lockout User',
            email: 'no.lockout@hogent.be',
            password_hash: passwordHash,
            roles: JSON.stringify([Role.USER]),
          },
          {
            id: 8,
            name: 'Almost Lockout User',
            email: 'almost.lockout@hogent.be',
            password_hash: passwordHash,
            roles: JSON.stringify([Role.USER]),
          },
          {
            id: 9,
            name: 'Lockout User',
            email: 'lockout@hogent.be',
            password_hash: passwordHash,
            roles: JSON.stringify([Role.USER]),
          },
          {
            id: 10,
            name: 'Lockout Passed User',
            email: 'lockout.passed@hogent.be',
            password_hash: passwordHash,
            roles: JSON.stringify([Role.USER]),
          },
        ]);

        await knex(tables.userLockout).insert([
          {
            id: 7,
            user_id: 7,
            failed_login_attempts: MAX_FAILED_LOGIN_ATTEMPTS - 1,
            end_time: null,
          },
          {
            id: 8,
            user_id: 8,
            failed_login_attempts: MAX_FAILED_LOGIN_ATTEMPTS - 1,
            end_time: null,
          },
          {
            id: 9,
            user_id: 9,
            failed_login_attempts: MAX_FAILED_LOGIN_ATTEMPTS,
            end_time: addDays(new Date(), 1),
          },
          {
            id: 10,
            user_id: 10,
            failed_login_attempts: MAX_FAILED_LOGIN_ATTEMPTS,
            end_time: subMinutes(new Date(), 1),
          },
        ]);
      });

      afterAll(async () => {
        await deleteUsers([7, 8, 9, 10]);
      });

      it('should 401 and reset account lockout after successful login', async () => {
        await supertest.post(url).send({
          email: 'no.lockout@hogent.be',
          password: passwords.valid,
        });

        const response = await supertest.post(url).send({
          email: 'no.lockout@hogent.be',
          password: passwords.invalid,
        });

        expect(response.statusCode).toBe(401);
        expect(response.body).toMatchObject({
          code: 'UNAUTHORIZED',
          message: 'The given email and password do not match',
          details: {},
        });
      });

      it('should 401 and lock user account', async () => {
        const response = await supertest.post(url).send({
          email: 'almost.lockout@hogent.be',
          password: passwords.invalid,
        });

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toMatch(/^The account is locked/);
      });

      it('should 401 when user account is locked', async () => {
        const response = await supertest.post(url).send({
          email: 'lockout@hogent.be',
          password: passwords.valid,
        });

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toMatch(/^The account is locked/);
      });

      it('should 200 and reset after lockout endtime has passed', async () => {
        const response = await supertest.post(url).send({
          email: 'lockout.passed@hogent.be',
          password: passwords.valid,
        });

        expect(response.statusCode).toBe(200);
      });

      it('should 401 and reset account lockout after successful password reset', async () => {
        throw new Error('Not implemented');
      });
    });
  });

  describe('POST /api/users/register', () => {
    const url = '/api/users/register';
    const deleteIds = [4];

    beforeAll(async () => {
      await insertUsers({
        id: 4,
        name: 'Duplicate User',
        email: 'duplicate@hogent.be',
      });
    });

    afterAll(async () => {
      await deleteUsers(deleteIds);
    });

    it('should 200 and return the registered user', async () => {
      const response = await supertest.post(url).send({
        name: 'Register User',
        email: 'register@hogent.be',
        password: passwords.valid,
      });

      deleteIds.push(response.body.user.id);

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.user.id).toBeTruthy();
      expect(response.body.user.name).toBe('Register User');
      expect(response.body.user.email).toBe('register@hogent.be');
    });

    it('should 400 when using duplicate email', async () => {
      const response = await supertest.post(url).send({
        name: 'Duplicate User',
        email: 'duplicate@hogent.be',
        password: passwords.valid,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        code: 'VALIDATION_FAILED',
        message: 'There is already a user with this email address',
        details: {},
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 when missing name', async () => {
      const response = await supertest.post(url).send({
        email: 'register@hogent.be',
        password: passwords.valid,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('name');
    });

    it('should 400 when missing email', async () => {
      const response = await supertest.post(url).send({
        name: 'Register User',
        password: passwords.valid,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('email');
    });

    it('should 400 when missing passsword', async () => {
      const response = await supertest.post(url).send({
        name: 'Register User',
        email: 'register@hogent.be',
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('password');
    });

    it('should 400 when passsword too short', async () => {
      const response = await supertest.post(url).send({
        name: 'Register User',
        email: 'register@hogent.be',
        password: passwords.tooShort,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('password');
    });

    it('should 400 when passsword too long', async () => {
      const response = await supertest.post(url).send({
        name: 'Register User',
        email: 'register@hogent.be',
        password: passwords.tooLong,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('password');
    });

    it('should 400 when password has been breached', async () => {
      const response = await supertest.post(url).send({
        name: 'Register User',
        email: 'register@hogent.be',
        password: passwords.breached,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('password');
    });
  });

  describe('GET /api/users', () => {
    const url = '/api/users';

    beforeAll(async () => {
      await insertUsers([
        {
          id: 4,
          name: 'User One',
          email: 'user1@hogent.be',
        },
        {
          id: 5,
          name: 'User Two',
          email: 'user2@hogent.be',
        },
        {
          id: 6,
          name: 'User Three',
          email: 'user3@hogent.be',
        },
      ]);
    });

    afterAll(async () => {
      await deleteUsers([4, 5, 6]);
    });

    it('should 200 and return all users', async () => {
      const response = await supertest
        .get(url)
        .set('Authorization', adminAuthHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body.count).toBe(5);
      expect(response.body.items.length).toBe(5);

      expect(response.body.items).toEqual(
        expect.arrayContaining([
          {
            id: 4,
            name: 'User One',
            email: 'user1@hogent.be',
          },
          {
            id: 6,
            name: 'User Three',
            email: 'user3@hogent.be',
          },
        ]),
      );
    });

    it('should 400 when given an argument', async () => {
      const response = await supertest
        .get(`${url}?invalid=true`)
        .set('Authorization', adminAuthHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('invalid');
    });

    testAuthHeader(() => supertest.get(url));
  });

  describe('GET /api/user/:id', () => {
    const url = '/api/users';

    beforeAll(async () => {
      await insertUsers({
        id: 4,
        name: 'User One',
        email: 'user1@hogent.be',
      });
    });

    afterAll(async () => {
      await deleteUsers([4]);
    });

    it('should 200 and return the requested user', async () => {
      const response = await supertest
        .get(`${url}/1`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        name: 'Test User',
      });
    });

    it("should 403 when requesting other user's info", async () => {
      const response = await supertest
        .get(`${url}/2`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchObject({
        code: 'FORBIDDEN',
        message: "You are not allowed to view this user's information",
        details: {},
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 with invalid user id', async () => {
      const response = await supertest
        .get(`${url}/invalid`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });

    testAuthHeader(() => supertest.get(`${url}/1`));
  });

  describe('PUT /api/users/:id', () => {
    const url = '/api/users';
    let updateAuthHeader;

    beforeAll(async () => {
      await insertUsers({
        id: 5,
        name: 'Update User',
        email: 'update.user@hogent.be',
      });

      let response = await supertest.post(`${url}/login`).send({
        email: 'update.user@hogent.be',
        password: passwords.valid,
      });
      updateAuthHeader = `Bearer ${response.body.token}`;
    });

    afterAll(async () => {
      // Delete the update users
      await deleteUsers([5]);
    });

    it('should 200 and return the updated user', async () => {
      const response = await supertest
        .put(`${url}/5`)
        .set('Authorization', updateAuthHeader)
        .send({
          name: 'Changed name',
          email: 'update.user@hogent.be',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 5,
        name: 'Changed name',
        email: 'update.user@hogent.be',
      });
    });

    it('should 400 for duplicate email', async () => {
      const response = await supertest
        .put(`${url}/1`)
        .set('Authorization', authHeader)
        .send({
          name: 'Changed name',
          email: 'update.user@hogent.be',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        code: 'VALIDATION_FAILED',
        message: 'There is already a user with this email address',
        details: {},
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 when missing name', async () => {
      const response = await supertest
        .put(`${url}/5`)
        .set('Authorization', updateAuthHeader)
        .send({
          email: 'update.user@hogent.be',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('name');
    });

    it('should 400 when missing email', async () => {
      const response = await supertest
        .put(`${url}/5`)
        .set('Authorization', updateAuthHeader)
        .send({
          name: 'Changed name',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('email');
    });

    it('should 403 with other than signed in user', async () => {
      const response = await supertest
        .delete(`${url}/3`)
        .set('Authorization', updateAuthHeader);

      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchObject({
        code: 'FORBIDDEN',
        message: "You are not allowed to view this user's information",
        details: {},
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 404 with not existing user', async () => {
      const response = await supertest
        .delete(`${url}/123`)
        .set('Authorization', adminAuthHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No user with id 123 exists',
        details: {
          id: 123,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    testAuthHeader(() =>
      supertest.put(`${url}/3`).send({
        name: 'The wrong user',
        email: 'update.user@hogent.be',
      }),
    );
  });

  describe('DELETE /api/users/:id', () => {
    const url = '/api/users';
    let deleteAuthHeader;

    beforeAll(async () => {
      await insertUsers({
        id: 5,
        name: 'Delete User',
        email: 'delete.user@hogent.be',
      });

      let response = await supertest.post(`${url}/login`).send({
        email: 'delete.user@hogent.be',
        password: passwords.valid,
      });
      deleteAuthHeader = `Bearer ${response.body.token}`;
    });

    it('should 403 with other than signed in user', async () => {
      const response = await supertest
        .delete(`${url}/7`)
        .set('Authorization', deleteAuthHeader);

      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchObject({
        code: 'FORBIDDEN',
        message: "You are not allowed to view this user's information",
        details: {},
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 404 with not existing user', async () => {
      const response = await supertest
        .delete(`${url}/123`)
        .set('Authorization', adminAuthHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No user with id 123 exists',
        details: {
          id: 123,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 204 and return nothing', async () => {
      const response = await supertest
        .delete(`${url}/5`)
        .set('Authorization', deleteAuthHeader);

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    testAuthHeader(() => supertest.delete(`${url}/5`));
  });
});

const { hashSecret } = require('../../src/core/hashing');
const Role = require('../../src/core/roles');
const { tables } = require('../../src/data');
const { testAuthHeader } = require('../common/auth');
const {
  users: { login: loginUser },
  passwords,
} = require('../constants');
const { withServer, login, loginAdmin } = require('../supertest.setup');

describe('Users', () => {
  let supertest, knex, authHeader, adminAuthHeader, validPasswordHash;

  withServer(({ supertest: s, knex: k }) => {
    supertest = s;
    knex = k;
  });

  beforeAll(async () => {
    authHeader = await login(supertest);
    adminAuthHeader = await loginAdmin(supertest);
    validPasswordHash = await hashSecret(passwords.valid);
  });

  describe('POST /api/users/login', () => {
    const url = '/api/users/login';

    beforeAll(async () => {
      // Insert a test user with a valid password.
      const passwordHash = await hashSecret(loginUser.password);

      await knex(tables.user).insert([
        {
          id: loginUser.id,
          name: loginUser.name,
          email: loginUser.email,
          password_hash: passwordHash,
          roles: JSON.stringify([Role.USER]),
        },
      ]);
    });

    afterAll(async () => {
      // Remove the created user.
      await knex(tables.user).where('id', loginUser.id).delete();
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
        password: 'invalid-password-r"Q[`?jZxkG8s7A#9]M6tc',
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
  });

  describe('POST /api/users/register', () => {
    const url = '/api/users/register';

    beforeAll(async () => {
      await knex(tables.user).insert([
        {
          id: 4,
          name: 'Duplicate User',
          email: 'duplicate@hogent.be',
          password_hash: validPasswordHash,
          roles: JSON.stringify([Role.USER]),
        },
      ]);
    });

    afterAll(async () => {
      await knex(tables.user)
        .whereIn('email', ['register@hogent.be', 'duplicate@hogent.be'])
        .delete();
    });

    it('should 200 and return the registered user', async () => {
      const response = await supertest.post(url).send({
        name: 'Register User',
        email: 'register@hogent.be',
        password: passwords.valid,
      });

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
      await knex(tables.user).insert([
        {
          id: 4,
          name: 'User One',
          email: 'user1@hogent.be',
          password_hash: validPasswordHash,
          roles: JSON.stringify([Role.USER]),
        },
        {
          id: 5,
          name: 'User Two',
          email: 'user2@hogent.be',
          password_hash: validPasswordHash,
          roles: JSON.stringify([Role.USER]),
        },
        {
          id: 6,
          name: 'User Three',
          email: 'user3@hogent.be',
          password_hash: validPasswordHash,
          roles: JSON.stringify([Role.USER]),
        },
      ]);
    });

    afterAll(async () => {
      await knex(tables.user).whereIn('id', [4, 5, 6]).delete();
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
      await knex(tables.user).insert([
        {
          id: 4,
          name: 'User One',
          email: 'user1@hogent.be',
          password_hash: validPasswordHash,
          roles: JSON.stringify([Role.USER]),
        },
      ]);
    });

    afterAll(async () => {
      await knex(tables.user).where('id', 4).delete();
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
      await knex(tables.user).insert([
        {
          id: 5,
          name: 'Update User',
          email: 'update.user@hogent.be',
          password_hash: validPasswordHash,
          roles: JSON.stringify([Role.USER]),
        },
      ]);

      let response = await supertest.post(`${url}/login`).send({
        email: 'update.user@hogent.be',
        password: passwords.valid,
      });
      updateAuthHeader = `Bearer ${response.body.token}`;
    });

    afterAll(async () => {
      // Delete the update users
      await knex(tables.user).delete().where('id', 5);
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
      await knex(tables.user).insert([
        {
          id: 5,
          name: 'Delete User',
          email: 'delete.user@hogent.be',
          password_hash: validPasswordHash,
          roles: JSON.stringify([Role.USER]),
        },
      ]);

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

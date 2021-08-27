const { tables } = require('../../src/data');
const { testAuthHeader } = require('../common/auth');
const { withServer, login } = require('../supertest.setup');

describe('Users', () => {

  let supertest, knex, authHeader;

  withServer(({ supertest: s, knex: k }) => {
    supertest = s;
    knex = k;
  });

  beforeAll(async () => {
    authHeader = await login(supertest);
  });

  describe('POST /api/users/login', () => {

    const url = '/api/users/login';

    beforeAll(async () => {
      // Insert a test user with password 12345678
      await knex(tables.user).insert([{
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff81',
        name: 'Login User',
        email: 'login@hogent.be',
        password_hash:
        '$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4',
        roles: JSON.stringify(['user']),
      }]);
    });

    afterAll(async () => {
      // Remove the created user
      await knex(tables.user)
        .where('id', '7f28c5f9-d711-4cd6-ac15-d13d71abff81')
        .delete();
    });

    test('it should 200 and return user and token when succesfully logged in', async () => {
      const response = await supertest.post(url)
        .send({
          email: 'login@hogent.be',
          password: '12345678',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.user).toEqual({
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff81',
        name: 'Login User',
        email: 'login@hogent.be',
      });
    });

    test('it should 401 with wrong email', async () => {
      const response = await supertest.post(url)
        .send({
          email: 'invalid@hogent.be',
          password: '12345678',
        });

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        code: 'UNAUTHORIZED',
        message: 'The given email and password do not match',
        details: {},
      });
    });

    test('it should 401 with wrong password', async () => {
      const response = await supertest.post(url)
        .send({
          email: 'login@hogent.be',
          password: 'invalidpassword',
        });

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        code: 'UNAUTHORIZED',
        message: 'The given email and password do not match',
        details: {},
      });
    });

    test('it should 400 with invalid email', async () => {
      const response = await supertest.post(url)
        .send({
          email: 'invalid',
          password: '12345678',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('email');
    });

    test('it should 400 when no password given', async () => {
      const response = await supertest.post(url)
        .send({
          email: 'login@hogent.be',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('password');
    });

    test('it should 400 when no email given', async () => {
      const response = await supertest.post(url)
        .send({
          password: '12345678',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('email');
    });
  });

  describe('POST /api/users/register', () => {

    const url = '/api/users/register';

    beforeAll(async () => {
      await knex(tables.user).insert([{
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff81',
        name: 'Duplicate User',
        email: 'duplicate@hogent.be',
        password_hash:
        '$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4',
        roles: JSON.stringify(['user']),
      }]);
    });

    afterAll(async () => {
      await knex(tables.user)
        .whereIn('email', [
          'register@hogent.be',
          'duplicate@hogent.be',
        ])
        .delete();
    });

    test('it should 200 and return the registered user', async () => {
      const response = await supertest.post(url)
        .send({
          name: 'Register User',
          email: 'register@hogent.be',
          password: '12345678',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.user.id).toBeTruthy();
      expect(response.body.user.name).toBe('Register User');
      expect(response.body.user.email).toBe('register@hogent.be');
    });

    test('it should 400 when using duplicate email', async () => {
      const response = await supertest.post(url)
        .send({
          name: 'Duplicate User',
          email: 'duplicate@hogent.be',
          password: '12345678',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        code: 'VALIDATION_FAILED',
        message: 'There is already a user with this email address',
        details: {},
      });
    });

    test('it should 400 when missing name', async () => {
      const response = await supertest.post(url)
        .send({
          email: 'register@hogent.be',
          password: '12345678',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('name');
    });

    test('it should 400 when missing email', async () => {
      const response = await supertest.post(url)
        .send({
          name: 'Register User',
          password: '12345678',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('email');
    });

    test('it should 400 when missing passsword', async () => {
      const response = await supertest.post(url)
        .send({
          name: 'Register User',
          email: 'register@hogent.be',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('password');
    });

    test('it should 400 when passsword too short', async () => {
      const response = await supertest.post(url)
        .send({
          name: 'Register User',
          email: 'register@hogent.be',
          password: 'short',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('password');
    });

    test('it should 400 when passsword too long', async () => {
      const response = await supertest.post(url)
        .send({
          name: 'Register User',
          email: 'register@hogent.be',
          password: 'thisismuchtoolongbutwhocaresafterall?',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('password');
    });
  });

  describe('GET /api/users', () => {

    const url = '/api/users';

    beforeAll(async () => {
      await knex(tables.user).insert([{
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff82',
        name: 'User One',
        email: 'user1@hogent.be',
        password_hash:
        '$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4',
        roles: JSON.stringify(['user']),
      },
      {
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff83',
        name: 'User Two',
        email: 'user2@hogent.be',
        password_hash:
        '$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4',
        roles: JSON.stringify(['user']),
      },
      {
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff84',
        name: 'User Three',
        email: 'user3@hogent.be',
        password_hash:
        '$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4',
        roles: JSON.stringify(['user']),
      }]);
    });

    afterAll(async () => {
      await knex(tables.user)
        .whereIn('id', [
          '7f28c5f9-d711-4cd6-ac15-d13d71abff82',
          '7f28c5f9-d711-4cd6-ac15-d13d71abff83',
          '7f28c5f9-d711-4cd6-ac15-d13d71abff84',
        ])
        .delete();
    });

    test('it should 200 and return all users', async () => {
      const response = await supertest.get(url)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body.totalCount).toBe(4); // 3 created here + test user (global setup)
      expect(response.body.count).toBe(4);
      expect(response.body.limit).toBe(100);
      expect(response.body.offset).toBe(0);
      expect(response.body.data.length).toBe(4);
    });

    test('it should 200 and paginate the list of users', async () => {
      const response = await supertest.get(`${url}?limit=2&offset=1`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body.totalCount).toBe(4); // 3 created here + test user (global setup)
      expect(response.body.count).toBe(2);
      expect(response.body.limit).toBe(2);
      expect(response.body.offset).toBe(1);

      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0]).toEqual({
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff82',
        name: 'User One',
        email: 'user1@hogent.be',
      });
      expect(response.body.data[1]).toEqual({
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff84',
        name: 'User Three',
        email: 'user3@hogent.be',
      });
    });

    test('it should 400 when offset is missing', async () => {
      const response = await supertest.get(`${url}?limit=2`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('value');
    });

    test('it should 400 when limit is missing', async () => {
      const response = await supertest.get(`${url}?offset=1`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('value');
    });

    test('it should 400 when limit is zero', async () => {
      const response = await supertest.get(`${url}?limit=0offset=1`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('limit');
    });

    test('it should 400 when limit is negative', async () => {
      const response = await supertest.get(`${url}?limit=-10offset=1`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('limit');
    });

    test('it should 400 when offset is negative', async () => {
      const response = await supertest.get(`${url}?limit=10&offset=-15`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('offset');
    });

    testAuthHeader(() => supertest.get(url));
  });

  describe('GET /api/user/:id', () => {
    const url = '/api/users';

    beforeAll(async () => {
      await knex(tables.user).insert([{
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff82',
        name: 'User One',
        email: 'user1@hogent.be',
        password_hash:
        '$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4',
        roles: JSON.stringify(['user']),
      }]);
    });

    afterAll(async () => {
      await knex(tables.user)
        .where('id', '7f28c5f9-d711-4cd6-ac15-d13d71abff82')
        .delete();
    });

    test('it should 200 and return the requested user', async () => {
      const response = await supertest.get(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff80`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
        name: 'Test User',
        email: 'test.user@hogent.be',
      });
    });

    test('it should 403 when requesting other user\'s info', async () => {
      const response = await supertest.get(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff82`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(403);
      expect(response.body).toEqual({
        code: 'FORBIDDEN',
        message: 'You are not allowed to view this user\'s information',
        details: {},
      });
    });

    test('it should 400 with invalid user id', async () => {
      const response = await supertest.get(`${url}/invalid`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });

    testAuthHeader(() => supertest.get(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff80`));
  });
});

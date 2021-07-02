const { getKnex, tables } = require('../../src/data');
const { got, login } = require('../got.setup');
const withData = require('../withData');

describe('Users', () => {

  withData();
  let authedGot;

  beforeAll(async () => {
    authedGot = await login();
  });

  describe('/api/users/login', () => {

    const url = 'api/users/login';

    beforeAll(async () => {
      // Insert a test user with password 12345678
      await getKnex()(tables.user).insert([{
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff81',
        first_name: 'Login',
        last_name: 'User',
        email: 'login@hogent.be',
        password_hash:
        '$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4',
        roles: JSON.stringify(['user']),
      }]);
    });

    afterAll(async () => {
      // Remove the created user
      await getKnex()(tables.user)
        .where('id', '7f28c5f9-d711-4cd6-ac15-d13d71abff81')
        .delete();
    });

    test('should 200 and return user and token when succesfully logged in', async () => {
      const response = await got.post(url, {
        json: {
          email: 'login@hogent.be',
          password: '12345678',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.user).toEqual({
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff81',
        firstName: 'Login',
        lastName: 'User',
        email: 'login@hogent.be',
      });
    });

    test('should 401 with wrong email', async () => {
      const response = await got.post(url, {
        json: {
          email: 'invalid@hogent.be',
          password: '12345678',
        },
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        code: 'UNAUTHORIZED',
        message: 'The given email and password do not match',
        details: {},
      });
    });

    test('should 401 with wrong password', async () => {
      const response = await got.post(url, {
        json: {
          email: 'login@hogent.be',
          password: 'invalidpassword',
        },
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        code: 'UNAUTHORIZED',
        message: 'The given email and password do not match',
        details: {},
      });
    });

    test('should 400 with invalid email', async () => {
      const response = await got.post(url, {
        json: {
          email: 'invalid',
          password: '12345678',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('email');
    });

    test('should 400 when no password given', async () => {
      const response = await got.post(url, {
        json: {
          email: 'login@hogent.be',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('password');
    });

    test('should 400 when no email given', async () => {
      const response = await got.post(url, {
        json: {
          password: '12345678',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('email');
    });
  });

  describe('/api/users/register', () => {

    const url = 'api/users/register';

    afterAll(async () => {
      await getKnex()(tables.user)
        .where('email', 'register@hogent.be')
        .delete();
    });

    test('should 200 and return the registered user', async () => {
      const response = await got.post(url, {
        json: {
          firstName: 'Register',
          lastName: 'User',
          email: 'register@hogent.be',
          password: '12345678',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.user.id).toBeTruthy();
      expect(response.body.user.firstName).toBe('Register');
      expect(response.body.user.lastName).toBe('User');
      expect(response.body.user.email).toBe('register@hogent.be');
    });

    test('should 400 when missing firstName', async () => {
      const response = await got.post(url, {
        json: {
          lastName: 'User',
          email: 'register@hogent.be',
          password: '12345678',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('firstName');
    });

    test('should 400 when missing lastName', async () => {
      const response = await got.post(url, {
        json: {
          firstName: 'Register',
          email: 'register@hogent.be',
          password: '12345678',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('lastName');
    });

    test('should 400 when missing email', async () => {
      const response = await got.post(url, {
        json: {
          firstName: 'Register',
          lastName: 'User',
          password: '12345678',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('email');
    });

    test('should 400 when missing passsword', async () => {
      const response = await got.post(url, {
        json: {
          firstName: 'Register',
          lastName: 'User',
          email: 'register@hogent.be',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('password');
    });

    test('should 400 when passsword too short', async () => {
      const response = await got.post(url, {
        json: {
          firstName: 'Register',
          lastName: 'User',
          email: 'register@hogent.be',
          password: 'short',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('password');
    });

    test('should 400 when passsword too long', async () => {
      const response = await got.post(url, {
        json: {
          firstName: 'Register',
          lastName: 'User',
          email: 'register@hogent.be',
          password: 'thisismuchtoolongbutwhocaresafterall?',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('password');
    });
  });

  describe('/api/users', () => {

    const url = 'api/users';

    beforeAll(async () => {
      await getKnex()(tables.user).insert([{
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff82',
        first_name: 'User',
        last_name: 'One',
        email: 'user1@hogent.be',
        password_hash:
        '$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4',
        roles: JSON.stringify(['user']),
      },
      {
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff83',
        first_name: 'User',
        last_name: 'Two',
        email: 'user2@hogent.be',
        password_hash:
        '$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4',
        roles: JSON.stringify(['user']),
      },
      {
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff84',
        first_name: 'User',
        last_name: 'Three',
        email: 'user3@hogent.be',
        password_hash:
        '$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4',
        roles: JSON.stringify(['user']),
      },
      ]);
    });

    afterAll(async () => {
      await getKnex()(tables.user)
        .whereIn('id', [
          '7f28c5f9-d711-4cd6-ac15-d13d71abff82',
          '7f28c5f9-d711-4cd6-ac15-d13d71abff83',
          '7f28c5f9-d711-4cd6-ac15-d13d71abff84',
        ])
        .delete();
    });

    test('should 200 and return all users', async () => {
      const response = await authedGot(url);

      expect(response.statusCode).toBe(200);
      expect(response.body.totalCount).toBe(4); // 3 created here + test user (global setup)
      expect(response.body.count).toBe(4);
      expect(response.body.limit).toBe(100);
      expect(response.body.offset).toBe(0);
    });

    test('should 200 and paginate the list of users', async () => {
      const response = await authedGot(`${url}?limit=2&offset=1`);

      expect(response.statusCode).toBe(200);
      expect(response.body.totalCount).toBe(4); // 3 created here + test user (global setup)
      expect(response.body.count).toBe(2);
      expect(response.body.limit).toBe(2);
      expect(response.body.offset).toBe(1);

      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0]).toEqual({
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff82',
        firstName: 'User',
        lastName: 'One',
        email: 'user1@hogent.be',
      });
      expect(response.body.data[1]).toEqual({
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff84',
        firstName: 'User',
        lastName: 'Three',
        email: 'user3@hogent.be',
      });
    });

    test('should 400 when offset is missing', async () => {
      const response = await authedGot(`${url}?limit=2`);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('value');
    });

    test('should 400 when limit is missing', async () => {
      const response = await authedGot(`${url}?offset=1`);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('value');
    });

    test('should 400 when limit is zero', async () => {
      const response = await authedGot(`${url}?limit=0offset=1`);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('limit');
    });

    test('should 400 when limit is negative', async () => {
      const response = await authedGot(`${url}?limit=-10offset=1`);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('limit');
    });

    test('should 400 when offset is negative', async () => {
      const response = await authedGot(`${url}?limit=10&offset=-15`);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('offset');
    });
  });

  describe('/api/user/:id', () => {
    const url = 'api/users';

    beforeAll(async () => {
      await getKnex()(tables.user).insert([{
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff82',
        first_name: 'User',
        last_name: 'One',
        email: 'user1@hogent.be',
        password_hash:
        '$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4',
        roles: JSON.stringify(['user']),
      }]);
    });

    afterAll(async () => {
      await getKnex()(tables.user)
        .where('id', '7f28c5f9-d711-4cd6-ac15-d13d71abff82')
        .delete();
    });

    test('should 200 and return the requested user', async () => {
      const response = await authedGot(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff80`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
        firstName: 'Test',
        lastName: 'User',
        email: 'test.user@hogent.be',
      });
    });

    test('should 403 when requesting other user\'s info', async () => {
      const response = await authedGot(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff82`);

      expect(response.statusCode).toBe(403);
      expect(response.body).toEqual({
        code: 'UNAUTHORIZED',
        message: 'You are not allowed to view this user\'s information',
        details: {},
      });
    });

    test('should 400 with invalid user id', async () => {
      const response = await authedGot(`${url}/invalid`);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });
  });
});

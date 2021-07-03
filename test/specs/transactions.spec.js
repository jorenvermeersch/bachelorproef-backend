const { tables } = require('../../src/data');
const { testAuthHeader } = require('../common/auth');
const { withServer, login } = require('../supertest.setup');

describe('Transactions', () => {
  let supertest, knex, authHeader;

  withServer(({ supertest: s, knex: k }) => {
    supertest = s;
    knex = k;
  });

  beforeAll(async () => {
    authHeader = await login(supertest);
  });

  describe('GET /api/transactions', () => {

    const url = '/api/transactions';

    beforeAll(async () => {
      await knex(tables.place).insert([{
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
        name: 'Test place',
        rating: 3,
      }]);

      await knex(tables.transaction).insert([
        { // Test User
          id: '7f28c5f9-d711-4cd6-ac15-d13d71abff86',
          user_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
          place_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
          amount: 3500,
          date: new Date(2021, 4, 25, 19, 40),
        },
        {
          id: '7f28c5f9-d711-4cd6-ac15-d13d71abff87',
          user_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
          place_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
          amount: -220,
          date: new Date(2021, 4, 8, 20, 0),
        },
        {
          id: '7f28c5f9-d711-4cd6-ac15-d13d71abff88',
          user_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
          place_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
          amount: -74,
          date: new Date(2021, 4, 21, 14, 30),
        },
      ]);
    });

    afterAll(async () => {
      await knex(tables.transaction)
        .whereIn('id', [
          '7f28c5f9-d711-4cd6-ac15-d13d71abff86',
          '7f28c5f9-d711-4cd6-ac15-d13d71abff87',
          '7f28c5f9-d711-4cd6-ac15-d13d71abff88',
        ])
        .delete();

      await knex(tables.place)
        .where('id', '7f28c5f9-d711-4cd6-ac15-d13d71abff90')
        .delete();
    });

    test('it should 200 and return all transactions', async () => {
      const response = await supertest.get(url)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body.totalCount).toBe(3);
      expect(response.body.count).toBe(3);
      expect(response.body.limit).toBe(100);
      expect(response.body.offset).toBe(0);
      expect(response.body.data.length).toBe(3);
    });

    test('it should 200 and paginate the list of transactions', async () => {
      const response = await supertest.get(`${url}?limit=2&offset=1`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body.totalCount).toBe(3);
      expect(response.body.count).toBe(2);
      expect(response.body.limit).toBe(2);
      expect(response.body.offset).toBe(1);

      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0]).toEqual({ // Test User
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff88',
        user: {
          id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
          firstName: 'Test',
          lastName: 'User',
        },
        place: {
          id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
          name: 'Test place',
        },
        amount: -74,
        date: new Date(2021, 4, 21, 14, 30).toJSON(),
      });
      expect(response.body.data[1]).toEqual({
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff86',
        user: {
          id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
          firstName: 'Test',
          lastName: 'User',
        },
        place: {
          id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
          name: 'Test place',
        },
        amount: 3500,
        date: new Date(2021, 4, 25, 19, 40).toJSON(),
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

  describe('GET /api/transactions/:id', () => {

    const url = '/api/transactions';

    beforeAll(async () => {
      await knex(tables.place).insert([{
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
        name: 'Test place',
        rating: 3,
      }]);

      await knex(tables.transaction).insert([{
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff86',
        user_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
        place_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
        amount: 3500,
        date: new Date(2021, 4, 25, 19, 40),
      }]);
    });

    afterAll(async () => {
      await knex(tables.transaction)
        .where('id', '7f28c5f9-d711-4cd6-ac15-d13d71abff86')
        .delete();

      await knex(tables.place)
        .where('id', '7f28c5f9-d711-4cd6-ac15-d13d71abff90')
        .delete();
    });

    test('it should 200 and return the requested transaction', async () => {
      const response = await supertest.get(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff86`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff86',
        user: {
          id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
          firstName: 'Test',
          lastName: 'User',
        },
        place: {
          id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
          name: 'Test place',
        },
        amount: 3500,
        date: new Date(2021, 4, 25, 19, 40).toJSON(),
      });
    });

    test('it should 404 when requesting not existing transaction', async () => {
      const response = await supertest.get(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abffaa`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        code: 'NOT_FOUND',
        message: 'No transaction with id 7f28c5f9-d711-4cd6-ac15-d13d71abffaa exists',
        details: {
          id: '7f28c5f9-d711-4cd6-ac15-d13d71abffaa',
        },
      });
    });

    test('it should 400 with invalid transaction id', async () => {
      const response = await supertest.get(`${url}/invalid`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });

    testAuthHeader(() => supertest.get(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff86`));
  });

  describe('POST /api/transactions', () => {

    const transactionstoDelete = [];
    const url = '/api/transactions';

    beforeAll(async () => {
      await knex(tables.place).insert([{
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
        name: 'Test place',
        rating: 3,
      }]);
    });

    afterAll(async () => {
      await knex(tables.transaction)
        .whereIn('id', transactionstoDelete)
        .delete();

      await knex(tables.place)
        .where('id', '7f28c5f9-d711-4cd6-ac15-d13d71abff90')
        .delete();
    });

    test('it should 201 and return the created transaction', async () => {
      const response = await supertest.post(url)
        .set('Authorization', authHeader)
        .send({
          amount: 102,
          date: '2021-05-27T13:00:00.000Z',
          place: 'Test place',
          userId: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.id).toBeTruthy();
      expect(response.body.amount).toBe(102);
      expect(response.body.date).toBe('2021-05-27T13:00:00.000Z');
      expect(response.body.place).toEqual({
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
        name: 'Test place',
      });
      expect(response.body.user).toEqual({
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
        firstName: 'Test',
        lastName: 'User',
      });

      transactionstoDelete.push(response.body.id);
    });

    test('it should 400 when missing amount', async () => {
      const response = await supertest.post(url)
        .set('Authorization', authHeader)
        .send({
          date: '2021-05-27T13:00:00.000Z',
          place: 'Test place',
          userId: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('amount');
    });

    test('it should 400 when missing date', async () => {
      const response = await supertest.post(url)
        .set('Authorization', authHeader)
        .send({
          amount: 102,
          place: 'Test place',
          userId: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('date');
    });

    test('it should 400 when missing place', async () => {
      const response = await supertest.post(url)
        .set('Authorization', authHeader)
        .send({
          amount: 102,
          date: '2021-05-27T13:00:00.000Z',
          userId: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('place');
    });

    test('it should 400 when missing userId', async () => {
      const response = await supertest.post(url)
        .set('Authorization', authHeader)
        .send({
          amount: 102,
          date: '2021-05-27T13:00:00.000Z',
          place: 'Test place',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('userId');
    });

    testAuthHeader(() => supertest.post(url)
      .send({
        amount: 102,
        date: '2021-05-27T13:00:00.000Z',
        place: 'Test place',
        userId: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
      }));
  });

  describe('PUT /api/transactions/:id', () => {

    const url = '/api/transactions';

    beforeAll(async () => {
      await knex(tables.place).insert([{
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
        name: 'Test place',
        rating: 3,
      }]);

      await knex(tables.transaction).insert([{
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff89',
        amount: 102,
        date: new Date(2021, 4, 25, 19, 40),
        place_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
        user_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
      }]);
    });

    afterAll(async () => {
      await knex(tables.transaction)
        .where('id', '7f28c5f9-d711-4cd6-ac15-d13d71abff89')
        .delete();

      await knex(tables.place)
        .where('id', '7f28c5f9-d711-4cd6-ac15-d13d71abff90')
        .delete();
    });

    test('it should 200 and return the updated transaction', async () => {
      const response = await supertest.put(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff89`)
        .set('Authorization', authHeader)
        .send({
          amount: -125,
          date: '2021-05-27T13:00:00.000Z',
          place: 'Test place',
          userId: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBeTruthy();
      expect(response.body.amount).toBe(-125);
      expect(response.body.date).toBe('2021-05-27T13:00:00.000Z');
      expect(response.body.place).toEqual({
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
        name: 'Test place',
      });
      expect(response.body.user).toEqual({
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
        firstName: 'Test',
        lastName: 'User',
      });
    });

    test('it should 404 when updating not existing transaction', async () => {
      const response = await supertest.put(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abffaa`)
        .set('Authorization', authHeader).send({
          amount: -125,
          date: '2021-05-27T13:00:00.000Z',
          place: 'Test place',
          userId: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
        });

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        code: 'NOT_FOUND',
        message: 'No transaction with id 7f28c5f9-d711-4cd6-ac15-d13d71abffaa exists',
        details: {
          id: '7f28c5f9-d711-4cd6-ac15-d13d71abffaa',
        },
      });
    });

    test('it should 400 when missing amount', async () => {
      const response = await supertest.put(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff89`)
        .set('Authorization', authHeader)
        .send({
          date: '2021-05-27T13:00:00.000Z',
          place: 'Test place',
          userId: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('amount');
    });

    test('it should 400 when missing date', async () => {
      const response = await supertest.put(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff89`)
        .set('Authorization', authHeader)
        .send({
          amount: 102,
          place: 'Test place',
          userId: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('date');
    });

    test('it should 400 when missing place', async () => {
      const response = await supertest.put(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff89`)
        .set('Authorization', authHeader)
        .send({
          amount: 102,
          date: '2021-05-27T13:00:00.000Z',
          userId: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('place');
    });

    test('it should 400 when missing userId', async () => {
      const response = await supertest.put(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff89`)
        .set('Authorization', authHeader)
        .send({
          amount: 102,
          date: '2021-05-27T13:00:00.000Z',
          place: 'Test place',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('userId');
    });

    testAuthHeader(() => supertest.put(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff89`)
      .send({
        amount: -125,
        date: '2021-05-27T13:00:00.000Z',
        place: 'Test place',
        userId: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
      }));
  });

  describe('DELETE /api/transactions/:id', () => {
    const url = '/api/transactions';

    beforeAll(async () => {
      await knex(tables.place).insert([{
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
        name: 'Test place',
        rating: 3,
      }]);

      await knex(tables.transaction).insert([{
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff89',
        amount: 102,
        date: new Date(2021, 4, 25, 19, 40),
        place_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
        user_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
      }]);
    });

    afterAll(async () => {
      await knex(tables.place)
        .where('id', '7f28c5f9-d711-4cd6-ac15-d13d71abff90')
        .delete();
    });

    test('it should 204 and return nothing', async () => {
      const response = await supertest.delete(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff89`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    test('it should 404 with not existing place', async () => {
      const response = await supertest.delete(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff89`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        code: 'NOT_FOUND',
        message: 'No transaction with id 7f28c5f9-d711-4cd6-ac15-d13d71abff89 exists',
        details: {
          id: '7f28c5f9-d711-4cd6-ac15-d13d71abff89',
        },
      });
    });

    testAuthHeader(() => supertest.delete(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff89`));
  });
});

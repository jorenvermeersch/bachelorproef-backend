const {
  tables,
} = require('../../src/data');
const {
  testAuthHeader,
} = require('../common/auth');
const {
  withServer,
  login,
} = require('../supertest.setup');

describe('Transactions', () => {
  let supertest, knex, authHeader;

  withServer(({
    supertest: s,
    knex: k,
  }) => {
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
        id: 4,
        name: 'Test place',
        rating: 3,
      }]);

      await knex(tables.transaction).insert([{ // Test User
        id: 1,
        user_id: 1,
        place_id: 4,
        amount: 3500,
        date: new Date(2021, 4, 25, 19, 40),
      },
      {
        id: 2,
        user_id: 1,
        place_id: 4,
        amount: -220,
        date: new Date(2021, 4, 8, 20, 0),
      },
      {
        id: 3,
        user_id: 1,
        place_id: 4,
        amount: -74,
        date: new Date(2021, 4, 21, 14, 30),
      },
      ]);
    });

    afterAll(async () => {
      await knex(tables.transaction)
        .whereIn('id', [
          1,
          2,
          3,
        ])
        .delete();

      await knex(tables.place)
        .where('id', 4)
        .delete();
    });

    test('it should 200 and return all transactions', async () => {
      const response = await supertest.get(url)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body.count).toBe(3);
      expect(response.body.items.length).toBe(3);

      expect(response.body.items).toEqual(expect.arrayContaining([{ // Test User
        id: 2,
        user: {
          id: 1,
          name: 'Test User',
        },
        place: {
          id: 4,
          name: 'Test place',
        },
        amount: -220,
        date: new Date(2021, 4, 8, 20, 0).toJSON(),
      }, {
        id: 3,
        user: {
          id: 1,
          name: 'Test User',
        },
        place: {
          id: 4,
          name: 'Test place',
        },
        amount: -74,
        date: new Date(2021, 4, 21, 14, 30).toJSON(),
      }]));
    });

    test('it should 400 when given an argument', async () => {
      const response = await supertest.get(`${url}?invalid=true`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('invalid');
    });

    testAuthHeader(() => supertest.get(url));
  });

  describe('GET /api/transactions/:id', () => {

    const url = '/api/transactions';

    beforeAll(async () => {
      await knex(tables.place).insert([{
        id: 4,
        name: 'Test place',
        rating: 3,
      }]);

      await knex(tables.transaction).insert([{
        id: 1,
        user_id: 1,
        place_id: 4,
        amount: 3500,
        date: new Date(2021, 4, 25, 19, 40),
      }]);
    });

    afterAll(async () => {
      await knex(tables.transaction)
        .where('id', 1)
        .delete();

      await knex(tables.place)
        .where('id', 4)
        .delete();
    });

    test('it should 200 and return the requested transaction', async () => {
      const response = await supertest.get(`${url}/1`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        user: {
          id: 1,
          name: 'Test User',
        },
        place: {
          id: 4,
          name: 'Test place',
        },
        amount: 3500,
        date: new Date(2021, 4, 25, 19, 40).toJSON(),
      });
    });

    test('it should 404 when requesting not existing transaction', async () => {
      const response = await supertest.get(`${url}/2`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        code: 'NOT_FOUND',
        message: 'No transaction with id 2 exists',
        details: {
          id: 2,
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

    testAuthHeader(() => supertest.get(`${url}/1`));
  });

  describe('POST /api/transactions', () => {

    const transactionsToDelete = [];
    const url = '/api/transactions';

    beforeAll(async () => {
      await knex(tables.place).insert([{
        id: 4,
        name: 'Test place',
        rating: 3,
      }]);
    });

    afterAll(async () => {
      await knex(tables.transaction)
        .whereIn('id', transactionsToDelete)
        .delete();

      await knex(tables.place)
        .where('id', 4)
        .delete();
    });

    test('it should 201 and return the created transaction', async () => {
      const response = await supertest.post(url)
        .set('Authorization', authHeader)
        .send({
          amount: 102,
          date: '2021-05-27T13:00:00.000Z',
          placeId: 4,
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.id).toBeTruthy();
      expect(response.body.amount).toBe(102);
      expect(response.body.date).toBe('2021-05-27T13:00:00.000Z');
      expect(response.body.place).toEqual({
        id: 4,
        name: 'Test place',
      });
      expect(response.body.user).toEqual({
        id: 1,
        name: 'Test User',
      });

      transactionsToDelete.push(response.body.id);
    });

    test('it should 404 when place does not exist', async () => {
      const response = await supertest.post(url)
        .set('Authorization', authHeader).send({
          amount: -125,
          date: '2021-05-27T13:00:00.000Z',
          placeId: 123,
        });

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        code: 'NOT_FOUND',
        message: 'No place with id 123 exists',
        details: {
          id: 123,
        },
      });
    });

    test('it should 400 when missing amount', async () => {
      const response = await supertest.post(url)
        .set('Authorization', authHeader)
        .send({
          date: '2021-05-27T13:00:00.000Z',
          placeId: 4,
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
          placeId: 4,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('date');
    });

    test('it should 400 when missing placeId', async () => {
      const response = await supertest.post(url)
        .set('Authorization', authHeader)
        .send({
          amount: 102,
          date: '2021-05-27T13:00:00.000Z',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('placeId');
    });

    testAuthHeader(() => supertest.post(url)
      .send({
        amount: 102,
        date: '2021-05-27T13:00:00.000Z',
        place: 'Test place',
        userId: 1,
      }));
  });

  describe('PUT /api/transactions/:id', () => {

    const url = '/api/transactions';

    beforeAll(async () => {
      await knex(tables.place).insert([{
        id: 4,
        name: 'Test place',
        rating: 3,
      }]);

      await knex(tables.transaction).insert([{
        id: 4,
        amount: 102,
        date: new Date(2021, 4, 25, 19, 40),
        place_id: 4,
        user_id: 1,
      }]);
    });

    afterAll(async () => {
      await knex(tables.transaction)
        .where('id', 4)
        .delete();

      await knex(tables.place)
        .where('id', 4)
        .delete();
    });

    test('it should 200 and return the updated transaction', async () => {
      const response = await supertest.put(`${url}/4`)
        .set('Authorization', authHeader)
        .send({
          amount: -125,
          date: '2021-05-27T13:00:00.000Z',
          placeId: 4,
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBeTruthy();
      expect(response.body.amount).toBe(-125);
      expect(response.body.date).toBe('2021-05-27T13:00:00.000Z');
      expect(response.body.place).toEqual({
        id: 4,
        name: 'Test place',
      });
      expect(response.body.user).toEqual({
        id: 1,
        name: 'Test User',
      });
    });

    test('it should 404 when updating not existing transaction', async () => {
      const response = await supertest.put(`${url}/2`)
        .set('Authorization', authHeader).send({
          amount: -125,
          date: '2021-05-27T13:00:00.000Z',
          placeId: 4,
        });

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        code: 'NOT_FOUND',
        message: 'No transaction with id 2 exists',
        details: {
          id: 2,
        },
      });
    });

    test('it should 404 when place does not exist', async () => {
      const response = await supertest.put(`${url}/4`)
        .set('Authorization', authHeader).send({
          amount: -125,
          date: '2021-05-27T13:00:00.000Z',
          placeId: 123,
        });

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        code: 'NOT_FOUND',
        message: 'No place with id 123 exists',
        details: {
          id: 123,
        },
      });
    });

    test('it should 400 when missing amount', async () => {
      const response = await supertest.put(`${url}/4`)
        .set('Authorization', authHeader)
        .send({
          date: '2021-05-27T13:00:00.000Z',
          placeId: 4,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('amount');
    });

    test('it should 400 when missing date', async () => {
      const response = await supertest.put(`${url}/4`)
        .set('Authorization', authHeader)
        .send({
          amount: 102,
          placeId: 4,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('date');
    });

    test('it should 400 when missing placeId', async () => {
      const response = await supertest.put(`${url}/4`)
        .set('Authorization', authHeader)
        .send({
          amount: 102,
          date: '2021-05-27T13:00:00.000Z',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('placeId');
    });

    testAuthHeader(() => supertest.put(`${url}/4`)
      .send({
        amount: -125,
        date: '2021-05-27T13:00:00.000Z',
        placeId: 4,
      }));
  });

  describe('DELETE /api/transactions/:id', () => {
    const url = '/api/transactions';

    beforeAll(async () => {
      await knex(tables.place).insert([{
        id: 4,
        name: 'Test place',
        rating: 3,
      }]);

      await knex(tables.transaction).insert([{
        id: 4,
        amount: 102,
        date: new Date(2021, 4, 25, 19, 40),
        place_id: 4,
        user_id: 1,
      }]);
    });

    afterAll(async () => {
      await knex(tables.place)
        .where('id', 4)
        .delete();
    });

    test('it should 204 and return nothing', async () => {
      const response = await supertest.delete(`${url}/4`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    test('it should 404 with not existing place', async () => {
      const response = await supertest.delete(`${url}/4`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        code: 'NOT_FOUND',
        message: 'No transaction with id 4 exists',
        details: {
          id: 4,
        },
      });
    });

    testAuthHeader(() => supertest.delete(`${url}/4`));
  });
});

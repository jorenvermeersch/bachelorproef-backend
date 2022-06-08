const { tables } = require('../../src/data');
const { testAuthHeader } = require('../common/auth');
const { withServer, login } = require('../supertest.setup');

describe('Places', () => {
  let supertest, knex, authHeader;

  withServer(({ supertest: s, knex: k }) => {
    supertest = s;
    knex = k;
  });

  beforeAll(async () => {
    authHeader = await login(supertest);
  });

  describe('GET /api/places', () => {

    const url = '/api/places';

    beforeAll(async () => {
      await knex(tables.place).insert([
        { id: '7f28c5f9-d711-4cd6-ac15-d13d71abff83', name: 'Loon', rating: 5 },
        { id: '7f28c5f9-d711-4cd6-ac15-d13d71abff84', name: 'Benzine', rating: 2 },
        { id: '7f28c5f9-d711-4cd6-ac15-d13d71abff85', name: 'Irish pub', rating: 4 },
      ]);
    });

    afterAll(async () => {
      await knex(tables.place)
        .whereIn('id', [
          '7f28c5f9-d711-4cd6-ac15-d13d71abff83',
          '7f28c5f9-d711-4cd6-ac15-d13d71abff84',
          '7f28c5f9-d711-4cd6-ac15-d13d71abff85',
        ])
        .delete();
    });

    test('it should 200 and return all places', async () => {
      const response = await supertest.get(url)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3); // one place from transactions could be present

      expect(response.body.data[0]).toEqual({
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff84',
        name: 'Benzine',
        rating: 2,
      });
      expect(response.body.data[1]).toEqual({
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff85',
        name: 'Irish pub',
        rating: 4,
      });
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

  describe('GET /api/places/:id', () => {

    const url = '/api/places';

    beforeAll(async () => {
      await knex(tables.place).insert([
        { id: '7f28c5f9-d711-4cd6-ac15-d13d71abff83', name: 'Loon', rating: 5 },
      ]);
    });

    afterAll(async () => {
      await knex(tables.place)
        .where('id', '7f28c5f9-d711-4cd6-ac15-d13d71abff83')
        .delete();
    });

    test('it should 200 and return the requested place', async () => {
      const response = await supertest.get(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff83`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff83',
        name: 'Loon',
        rating: 5,
      });
    });

    test('it should 404 when requesting not existing place', async () => {
      const response = await supertest.get(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abffaa`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        code: 'NOT_FOUND',
        message: 'No place with id 7f28c5f9-d711-4cd6-ac15-d13d71abffaa exists',
        details: {
          id: '7f28c5f9-d711-4cd6-ac15-d13d71abffaa',
        },
      });
    });

    test('it should 400 with invalid place id', async () => {
      const response = await supertest.get(`${url}/invalid`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });

    testAuthHeader(() => supertest.get(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abffaa`));
  });

  describe('POST /api/places', () => {

    const placesToDelete = [];
    const url = '/api/places';

    afterAll(async () => {
      await knex(tables.place)
        .whereIn('id', placesToDelete)
        .delete();
    });

    test('it should 201 and return the created place', async () => {
      const response = await supertest.post(url)
        .set('Authorization', authHeader)
        .send({
          name: 'New place',
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.id).toBeTruthy();
      expect(response.body.name).toBe('New place');
      expect(response.body.rating).toBeNull();

      placesToDelete.push(response.body.id);
    });

    test('it should 200 and return the created place with it\'s rating', async () => {
      const response = await supertest.post(url)
        .set('Authorization', authHeader)
        .send({
          name: 'Lovely place',
          rating: 5,
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.id).toBeTruthy();
      expect(response.body.name).toBe('Lovely place');
      expect(response.body.rating).toBe(5);

      placesToDelete.push(response.body.id);
    });

    test('it should 400 for duplicate place name', async () => {
      const response = await supertest.post(url)
        .set('Authorization', authHeader)
        .send({
          name: 'Lovely place',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        code: 'VALIDATION_FAILED',
        message: 'A place with this name already exists',
        details: {},
      });
    });

    test('it should 400 when missing name', async () => {
      const response = await supertest.post(url)
        .set('Authorization', authHeader)
        .send({
          rating: 3,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('name');
    });

    test('it should 400 when rating lower than one', async () => {
      const response = await supertest.post(url)
        .set('Authorization', authHeader)
        .send({
          name: 'The wrong place',
          rating: 0,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('rating');
    });

    test('it should 400 when rating higher than five', async () => {
      const response = await supertest.post(url)
        .set('Authorization', authHeader)
        .send({
          name: 'The wrong place',
          rating: 6,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('rating');
    });

    test('it should 400 when rating is a decimal', async () => {
      const response = await supertest.post(url)
        .set('Authorization', authHeader)
        .send({
          name: 'The wrong place',
          rating: 3.5,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('rating');
    });

    testAuthHeader(() => supertest.post(url)
      .send({
        name: 'The wrong place',
        rating: 3,
      }));
  });

  describe('PUT /api/places/:id', () => {

    const url = '/api/places';

    beforeAll(async () => {
      await knex(tables.place).insert([
        { id: '7f28c5f9-d711-4cd6-ac15-d13d71abff83', name: 'Loon', rating: 4 },
        { id: '7f28c5f9-d711-4cd6-ac15-d13d71abff84', name: 'Duplicate name', rating: 1 },
      ]);
    });

    afterAll(async () => {
      await knex(tables.place)
        .whereIn('id', [
          '7f28c5f9-d711-4cd6-ac15-d13d71abff83',
          '7f28c5f9-d711-4cd6-ac15-d13d71abff84',
        ])
        .delete();
    });

    test('it should 200 and return the updated place', async () => {
      const response = await supertest.put(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff83`)
        .set('Authorization', authHeader)
        .send({
          name: 'Changed name',
          rating: 1,
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff83',
        name: 'Changed name',
        rating: 1,
      });
    });

    test('it should 400 for duplicate place name', async () => {
      const response = await supertest.put(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff84`)
        .set('Authorization', authHeader)
        .send({
          name: 'Changed name',
          rating: 1,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        code: 'VALIDATION_FAILED',
        message: 'A place with this name already exists',
        details: {},
      });
    });

    test('it should 400 when missing name', async () => {
      const response = await supertest.put(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff83`)
        .set('Authorization', authHeader)
        .send({
          rating: 3,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('name');
    });

    test('it should 400 when missing rating', async () => {
      const response = await supertest.put(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff83`)
        .set('Authorization', authHeader)
        .send({
          name: 'The name',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('rating');
    });

    test('it should 400 when rating lower than one', async () => {
      const response = await supertest.put(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff83`)
        .set('Authorization', authHeader)
        .send({
          name: 'The wrong place',
          rating: 0,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('rating');
    });

    test('it should 400 when rating higher than five', async () => {
      const response = await supertest.put(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff83`)
        .set('Authorization', authHeader)
        .send({
          name: 'The wrong place',
          rating: 6,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('rating');
    });

    test('it should 400 when rating is a decimal', async () => {
      const response = await supertest.put(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff83`)
        .set('Authorization', authHeader)
        .send({
          name: 'The wrong place',
          rating: 3.5,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('rating');
    });

    testAuthHeader(() => supertest.put(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff83`)
      .send({
        name: 'The wrong place',
        rating: 3,
      }));
  });

  describe('DELETE /api/places/:id', () => {
    const url = '/api/places';

    beforeAll(async () => {
      await knex(tables.place).insert([
        { id: '7f28c5f9-d711-4cd6-ac15-d13d71abff83', name: 'Loon', rating: 4 },
      ]);
    });

    test('it should 204 and return nothing', async () => {
      const response = await supertest.delete(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff83`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    test('it should 404 with not existing place', async () => {
      const response = await supertest.delete(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff83`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        code: 'NOT_FOUND',
        message: 'No place with id 7f28c5f9-d711-4cd6-ac15-d13d71abff83 exists',
        details: {
          id: '7f28c5f9-d711-4cd6-ac15-d13d71abff83',
        },
      });
    });

    testAuthHeader(() => supertest.delete(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff83`));
  });
});

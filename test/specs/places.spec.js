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
        { id: 1, name: 'Loon', rating: 5 },
        { id: 2, name: 'Benzine', rating: 2 },
        { id: 3, name: 'Irish pub', rating: 4 },
      ]);
    });

    afterAll(async () => {
      await knex(tables.place).whereIn('id', [1, 2, 3]).delete();
    });

    it('should 200 and return all places', async () => {
      const response = await supertest
        .get(url)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body.items.length).toBeGreaterThanOrEqual(3); // one place from transactions could be present

      expect(response.body.items).toEqual(
        expect.arrayContaining([
          {
            id: 2,
            name: 'Benzine',
            rating: 2,
          },
          {
            id: 3,
            name: 'Irish pub',
            rating: 4,
          },
        ]),
      );
    });

    it('should 400 when given an argument', async () => {
      const response = await supertest
        .get(`${url}?invalid=true`)
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
      await knex(tables.place).insert([{ id: 1, name: 'Loon', rating: 5 }]);
    });

    afterAll(async () => {
      await knex(tables.place).where('id', 1).delete();
    });

    it('should 200 and return the requested place', async () => {
      const response = await supertest
        .get(`${url}/1`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        name: 'Loon',
        rating: 5,
      });
    });

    it('should 404 when requesting not existing place', async () => {
      const response = await supertest
        .get(`${url}/2`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No place with id 2 exists',
        details: {
          id: 2,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 with invalid place id', async () => {
      const response = await supertest
        .get(`${url}/invalid`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });

    testAuthHeader(() => supertest.get(`${url}/2`));
  });

  describe('POST /api/places', () => {
    const placesToDelete = [];
    const url = '/api/places';

    afterAll(async () => {
      await knex(tables.place).whereIn('id', placesToDelete).delete();
    });

    it('should 201 and return the created place', async () => {
      const response = await supertest
        .post(url)
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

    it('should 200 and return the created place with it\'s rating', async () => {
      const response = await supertest
        .post(url)
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

    it('should 400 for duplicate place name', async () => {
      const response = await supertest
        .post(url)
        .set('Authorization', authHeader)
        .send({
          name: 'Lovely place',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        code: 'VALIDATION_FAILED',
        message: 'A place with this name already exists',
        details: {},
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 when missing name', async () => {
      const response = await supertest
        .post(url)
        .set('Authorization', authHeader)
        .send({
          rating: 3,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('name');
    });

    it('should 400 when rating lower than one', async () => {
      const response = await supertest
        .post(url)
        .set('Authorization', authHeader)
        .send({
          name: 'The wrong place',
          rating: 0,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('rating');
    });

    it('should 400 when rating higher than five', async () => {
      const response = await supertest
        .post(url)
        .set('Authorization', authHeader)
        .send({
          name: 'The wrong place',
          rating: 6,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('rating');
    });

    it('should 400 when rating is a decimal', async () => {
      const response = await supertest
        .post(url)
        .set('Authorization', authHeader)
        .send({
          name: 'The wrong place',
          rating: 3.5,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('rating');
    });

    testAuthHeader(() =>
      supertest.post(url).send({
        name: 'The wrong place',
        rating: 3,
      }),
    );
  });

  describe('PUT /api/places/:id', () => {
    const url = '/api/places';

    beforeAll(async () => {
      await knex(tables.place).insert([
        { id: 1, name: 'Loon', rating: 4 },
        { id: 2, name: 'Duplicate name', rating: 1 },
      ]);
    });

    afterAll(async () => {
      await knex(tables.place).whereIn('id', [1, 2]).delete();
    });

    it('should 200 and return the updated place', async () => {
      const response = await supertest
        .put(`${url}/1`)
        .set('Authorization', authHeader)
        .send({
          name: 'Changed name',
          rating: 1,
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        name: 'Changed name',
        rating: 1,
      });
    });

    it('should 400 for duplicate place name', async () => {
      const response = await supertest
        .put(`${url}/2`)
        .set('Authorization', authHeader)
        .send({
          name: 'Changed name',
          rating: 1,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        code: 'VALIDATION_FAILED',
        message: 'A place with this name already exists',
        details: {},
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 when missing name', async () => {
      const response = await supertest
        .put(`${url}/1`)
        .set('Authorization', authHeader)
        .send({
          rating: 3,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('name');
    });

    it('should 400 when missing rating', async () => {
      const response = await supertest
        .put(`${url}/1`)
        .set('Authorization', authHeader)
        .send({
          name: 'The name',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('rating');
    });

    it('should 400 when rating lower than one', async () => {
      const response = await supertest
        .put(`${url}/1`)
        .set('Authorization', authHeader)
        .send({
          name: 'The wrong place',
          rating: 0,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('rating');
    });

    it('should 400 when rating higher than five', async () => {
      const response = await supertest
        .put(`${url}/1`)
        .set('Authorization', authHeader)
        .send({
          name: 'The wrong place',
          rating: 6,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('rating');
    });

    it('should 400 when rating is a decimal', async () => {
      const response = await supertest
        .put(`${url}/1`)
        .set('Authorization', authHeader)
        .send({
          name: 'The wrong place',
          rating: 3.5,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('rating');
    });

    testAuthHeader(() =>
      supertest.put(`${url}/1`).send({
        name: 'The wrong place',
        rating: 3,
      }),
    );
  });

  describe('DELETE /api/places/:id', () => {
    const url = '/api/places';

    beforeAll(async () => {
      await knex(tables.place).insert([{ id: 1, name: 'Loon', rating: 4 }]);
    });

    it('should 204 and return nothing', async () => {
      const response = await supertest
        .delete(`${url}/1`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    it('should 404 with not existing place', async () => {
      const response = await supertest
        .delete(`${url}/1`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No place with id 1 exists',
        details: {
          id: 1,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    testAuthHeader(() => supertest.delete(`${url}/1`));
  });
});

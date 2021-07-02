const { withServer } = require('../supertest.setup');
const packageJson = require('../../package.json');

describe('Health', () => {

  let supertest;
  withServer(({ supertest: s }) => supertest = s);

  describe('GET /api/health/ping', () => {
    const url = '/api/health/ping';

    test('should return pong', async () => {
      const response = await supertest.get(url);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        pong: true,
      });
    });
  });

  describe('GET /api/health/version', () => {
    const url = '/api/health/version';

    test('should return version from package.json', async () => {
      const response = await supertest.get(url);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        env: 'testing',
        version: packageJson.version,
        name: packageJson.name,
      });
    });
  });
});

describe('General', () => {
  const url = '/invalid';
  let supertest;
  withServer(({ supertest: s }) => supertest = s);

  test('should return 404 when accessing invalid url', async () => {
    const response = await supertest.get(url);

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      code: 'NOT_FOUND',
      message: `Unknown resource: ${url}`,
    });
  });
});

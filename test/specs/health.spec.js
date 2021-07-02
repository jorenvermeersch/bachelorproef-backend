const { got } = require('../got.setup');
const packageJson = require('../../package.json');

describe('Health', () => {

  describe('/api/health/ping', () => {
    const url = 'api/health/ping';

    test('should return pong', async () => {
      const response = await got(url);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        pong: true,
      });
    });
  });

  describe('/api/health/version', () => {
    const url = 'api/health/version';

    test('should return version from package.json', async () => {
      const response = await got(url);

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
  const url = 'invalid';

  test('should return 404 when accessing invalid url', async () => {
    const response = await got(url);

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      code: 'NOT_FOUND',
      message: `Unknown resource: /${url}`,
    });
  });
});

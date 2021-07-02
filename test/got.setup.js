const config = require('config');
const got = require('got');

const createClient = (authToken) => got.extend({
  prefixUrl: `http://${config.get('host')}:${config.get('port')}`,
  responseType: 'json',
  throwHttpErrors: false,
  headers: authToken ? {
    authorization: `Bearer ${authToken}`,
  } : {},
});

/**
 * Creates a got client where the test user is signed in
 */
const login = async () => {
  const response = await client.post('api/users/login', {
    json: {
      email: 'test.user@hogent.be',
      password: '12345678',
    },
  });

  if (response.statusCode !== 200) {
    throw new Error(response.body.message || 'Unknown error occured');
  }

  return createClient(response.body.token);
};

// Base client without auth token
const client = createClient();

module.exports = {
  got: client,
  login,
};

const supertest = require('supertest');

const { users } = require('./constants');
const createServer = require('../src/createServer');
const { getKnex } = require('../src/data');
const { admin: adminUser, test: testUser } = users;

/**
 * Sign in using the test user.
 *
 * @param {supertest.SuperTest<supertest.Test>} supertest - The supertest agent to use
 *
 * @returns {Promise<string>} The Authorization header to use.
 */
const login = async (supertest) => {
  const response = await supertest.post('/api/users/login').send({
    email: testUser.email,
    password: testUser.password,
  });

  if (response.statusCode !== 200) {
    throw new Error(response.body.message || 'Unknown error occured');
  }

  return `Bearer ${response.body.token}`;
};

/**
 * Sign in using the admin test user.
 *
 * @param {supertest.SuperTest<supertest.Test>} supertest - The supertest agent to use
 *
 * @returns {Promise<string>} The Authorization header to use.
 */
const loginAdmin = async (supertest) => {
  const response = await supertest.post('/api/users/login').send({
    email: adminUser.email,
    password: adminUser.password,
  });

  if (response.statusCode !== 200) {
    throw new Error(response.body.message || 'Unknown error occured');
  }

  return `Bearer ${response.body.token}`;
};

/**
 * Ensure a server instance is running.
 *
 * @param {Function} setter - Setter which gives access to the supertest agent and the Knex instance
 *
 * @returns {supertest.SuperAgentTest} A supertest agent.
 */
const withServer = (setter) => {
  let server;

  beforeAll(async () => {
    server = await createServer();

    setter({
      knex: getKnex(),
      supertest: supertest(server.getApp().callback()),
    });
  });

  afterAll(async () => {
    // Cleanup resources!
    await server.stop();
  });
};

module.exports = {
  login,
  loginAdmin,
  withServer,
};

const config = require('config');
const got = require('got');

const client = got.extend({
  prefixUrl: `http://${config.get('host')}:${config.get('port')}`,
  responseType: 'json',
  throwHttpErrors: false,
});

module.exports = {
  got: client,
};

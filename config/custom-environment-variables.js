module.exports = {
  env: 'NODE_ENV',
  host: 'HOST',
  port: 'PORT',
  log: {
    disabled: 'LOG_DISABLED',
  },
  database: {
    host: 'DATABASE_HOST',
    port: 'DATABASE_PORT',
    name: 'DATABASE_NAME',
    username: 'DATABASE_USER',
    password: 'DATABASE_PASSWORD',
  },
  auth: {
    disabled: 'AUTH_DISABLED',
    jwt: {
      secret: 'AUTH_JWT_SECRET',
    },
  },
};

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
    username: 'DATABASE_USERNAME',
    password: 'DATABASE_PASSWORD',
  },
  auth: {
    disabled: 'AUTH_DISABLED',
    jwt: {
      secret: 'AUTH_JWT_SECRET',
    },
  },
  mail: {
    host: 'MAIL_HOST',
    port: 'MAIL_PORT',
    username: 'MAIL_USERNAME',
    password: 'MAIL_PASSWORD',
  },
};

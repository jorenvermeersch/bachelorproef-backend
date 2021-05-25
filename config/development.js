module.exports = {
  env: process.env.NODE_ENV,
  host: '0.0.0.0',
  port: 9000,
  log: {
    level: 'silly',
    disabled: false,
  },
  cors: {
    origins: ['http://localhost:3000'],
    maxAge: 3 * 60 * 60, // 3h in seconds
  },
};

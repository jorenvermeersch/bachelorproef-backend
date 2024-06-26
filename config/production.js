module.exports = {
  protocol: 'http',
  host: 'localhost',
  port: 9000,
  log: {
    level: 'info',
    disabled: false,
  },
  cors: {
    origins: ['https://bachelorproef-frontend.onrender.com'],
    maxAge: 3 * 60 * 60, // 3h in seconds
  },
  database: {
    client: 'mysql2',
    name: 'budget',
  },
  auth: {
    disabled: false,
    maxDelay: 300, // ms
    maxFailedAttempts: 5,
    argon: {
      saltLength: 16,
      hashLength: 32,
      timeCost: 6,
      memoryCost: 2 ** 17,
    },
    jwt: {
      audience: 'budget.hogent.be',
      issuer: 'budget.hogent.be',
      expirationInterval: 60 * 60 * 1000, // ms (1 hour)
    },
  },
  mail: {
    host: null,
    port: null,
    username: null,
    password: null,
    maxDelay: 700,
  },
};

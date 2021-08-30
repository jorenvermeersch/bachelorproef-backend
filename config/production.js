module.exports = {
  protocol: 'http',
  host: 'localhost',
  port: 9000,
  exposeStack: true,
  log: {
    level: 'info',
    disabled: false,
  },
  cors: {
    origins: ['http://localhost:3000'],
    maxAge: 3 * 60 * 60, // 3h in seconds
  },
  database: {
    client: 'mysql2',
    name: 'budget',
  },
  pagination: {
    limit: 100,
    offset: 0,
  },
  auth: {
    disabled: false,
    maxDelay: 300, // ms
    maxWrongPasswords: 3,
    lockTime: 30 * 1000, // ms (30 seconds)
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
};
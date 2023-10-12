module.exports = {
  protocol: 'http',
  host: 'localhost',
  port: 9000,
  log: {
    level: 'info',
    disabled: false,
  },
  cors: {
    origins: ['https://frontendweb-budget-gked.onrender.com'],
    maxAge: 3 * 60 * 60, // 3h in seconds
  },
  database: {
    client: 'mysql2',
    name: 'budget',
  },
  auth: {
    disabled: false,
    maxDelay: 300, // ms
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

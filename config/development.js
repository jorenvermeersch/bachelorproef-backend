module.exports = {
  protocol: 'http',
  host: 'localhost',
  port: 9000,
  log: {
    level: 'silly',
    disabled: false,
  },
  cors: {
    origins: ['http://localhost:5173'],
    maxAge: 3 * 60 * 60, // 3h in seconds
  },
  database: {
    client: 'mysql2',
    host: 'localhost',
    port: 3306,
    name: 'budget',
    username: 'root',
    password: '',
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
      secret:
        'eenveeltemoeilijksecretdatniemandooitzalradenandersisdesitegehacked',
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

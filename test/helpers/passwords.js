const requestReset = async (email, supertest) => {
  const response = await supertest.post('/api/password/request-reset').send({
    email: email,
  });

  return response;
};

const parseResetEmail = (email) => {
  if (!email) {
    throw new Error('Email is required.');
  }

  const { text, to } = email;

  // The origin is undefined when testing, so you can't use `text` to create an URL.
  const params = new URLSearchParams(text.split('/')[1]);
  const token = params.get('token');

  return { token, email: to };
};

module.exports = { requestReset, parseResetEmail };

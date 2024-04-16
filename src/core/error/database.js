const isDatabaseError = (error) => {
  if (!error) {
    return false;
  }
  // Connection errors (i.e. ECONNREFUSED) throw AggregateError.
  if (error instanceof AggregateError) {
    return error.errors.some((err) => isDatabaseError(err));
  }

  return Boolean(error.errno);
};

module.exports = { isDatabaseError };

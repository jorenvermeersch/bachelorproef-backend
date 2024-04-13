// TODO: Add JSdoc.
const getUserFromContext = (ctx) => {
  const userId = ctx.state?.session?.userId;
  const userString = userId ? `User ${userId}` : 'unauthenticated user';
  return { userId: userId ?? -1, userString };
};

module.exports = { getUserFromContext };

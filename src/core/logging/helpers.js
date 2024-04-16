/**
 * Retrieve the user id and a user string for logging from the Koa context.
 * Returns 'unauthenticated user' for `userString` if no user is authenticated
 *
 * @param {object} ctx - The Koa context.
 * @returns {object} An object containing the user id and a user string.
 */
const getUserFromContext = (ctx) => {
  const userId = ctx.state?.session?.userId;
  const userString = userId ? `User ${userId}` : 'unauthenticated user';
  return { userId, userString };
};

module.exports = { getUserFromContext };

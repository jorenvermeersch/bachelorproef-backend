const { tables, getKnex } = require('../data');

const formatUser = ({ password_hash, ...rest }) => ({
  ...rest,
  passwordHash: password_hash,
});

/**
 * Get all users.
 *
 * @returns {Promise<object[]>} List of all users.
 */
const findAll = async () => {
  const users = await getKnex()(tables.user).select().orderBy('name', 'ASC');
  return users.map(formatUser);
};

/**
 * Calculate the total number of user.
 *
 * @returns {Promise<number>} The total number of users.
 */
const findCount = async () => {
  const [count] = await getKnex()(tables.user).count();
  return count['count(*)'];
};

/**
 * Find a user with the given id.
 *
 * @param {number} id - The id to search for.
 */
const findById = async (id) => {
  const user = await getKnex()(tables.user).where('id', id).first();

  if (!user) {
    return;
  }

  return formatUser(user);
};

/**
 * Find a user with the given email.
 *
 * @param {string} email - The email to search for.
 */
const findByEmail = async (email) => {
  const user = await getKnex()(tables.user).where('email', email).first();

  if (!user) {
    return;
  }

  return formatUser(user);
};

/**
 * Create a new user with the given `name`.
 *
 * @param {object} user - User to create.
 * @param {string} user.name - Name of the user.
 * @param {string} user.email - Email of the user.
 * @param {string} user.passwordHash - Hashed password of the user.
 * @param {string[]} user.roles - Roles of the user.
 */
const create = async ({ name, email, passwordHash, roles }) => {
  const [id] = await getKnex()(tables.user).insert({
    name,
    email,
    password_hash: passwordHash,
    roles: JSON.stringify(roles),
  });
  return id;
};

/**
 * Update a user with the given `id`.
 *
 * @param {number} id - Id of the user to update.
 * @param {object} user - User to save.
 * @param {string} user.name - Name of the user.
 * @param {string} user.email - Email of the user.
 */
const updateById = async (id, { name, email, passwordHash }) => {
  await getKnex()(tables.user)
    .update({
      name,
      email,
      password_hash: passwordHash,
    })
    .where('id', id);
  return id;
};

/**
 * Update a user with the given `id`.
 *
 * @param {number} id - Id of the user to delete.
 */
const deleteById = async (id) => {
  const rowsAffected = await getKnex()(tables.user).delete().where('id', id);
  return rowsAffected > 0;
};

module.exports = {
  findAll,
  findCount,
  findById,
  findByEmail,
  create,
  updateById,
  deleteById,
};

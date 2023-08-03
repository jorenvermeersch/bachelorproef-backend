const { tables, getKnex } = require('../data');

/**
 * Get all users.
 */
const findAll = () => getKnex()(tables.user)
  .select()
  .orderBy('name', 'ASC');

/**
 * Calculate the total number of user.
 */
const findCount = async () => {
  const [count] = await getKnex()(tables.user)
    .count();
  return count['count(*)'];
};

/**
 * Find a user with the given id.
 *
 * @param {number} id - The id to search for.
 */
const findById = (id) => getKnex()(tables.user)
  .where('id', id)
  .first();

/**
 * Find a user with the given email.
 *
 * @param {string} email - The email to search for.
 */
const findByEmail = (email) => getKnex()(tables.user)
  .where('email', email)
  .first();

/**
 * Create a new user with the given `name`.
 *
 * @param {object} user - User to create.
 * @param {string} user.name - Name of the user.
 * @param {string} user.email - Email of the user.
 * @param {string} user.passwordHash - Hashed password of the user.
 * @param {string[]} user.roles - Roles of the user.
 */
const create = async ({
  name,
  email,
  passwordHash,
  roles,
}) => {
  const [id] = await getKnex()(tables.user)
    .insert({
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
const updateById = async (id, {
  name,
  email,
}) => {
  await getKnex()(tables.user)
    .update({
      name,
      email,
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
  const rowsAffected = await getKnex()(tables.user)
    .delete()
    .where('id', id);
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

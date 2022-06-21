const { getLogger } = require('../core/logging');
const { tables, getKnex } = require('../data/index');
const { getLastId } = require('./_repository.helpers');

/**
 * Find all places.
 */
const findAll = () => {
  return getKnex()(tables.place)
    .select()
    .orderBy('name', 'ASC');
};

/**
 * Find a place with the given `name`.
 *
 * @param {string} name - Name to look for.
 */
const findByName = (name) => {
  return getKnex()(tables.place)
    .where('name', name)
    .first();
};

/**
 * Find a place with the given `id`.
 *
 * @param {string} id - Id of the place to find.
 */
const findById = (id) => {
  return getKnex()(tables.place)
    .where('id', id)
    .first();
};

/**
 * Create a new place with the given `name` and `rating`.
 *
 * @param {object} place - Place to create.
 * @param {string} place.name - Name of the place.
 * @param {number} [place.rating] - Rating given to the place (1 to 5).
 *
 * @returns {Promise<string>} Created place's id
 */
const create = async ({
  name,
  rating,
}) => {
  try {
    await getKnex()(tables.place)
      .insert({
        name,
        rating,
      });

    return await getLastId();
  } catch (error) {
    getLogger().error('Error in create', {
      error,
    });
    throw error;
  }
};

/**
 * Update an existing place with the given `name` and `rating`.
 *
 * @param {string} id - Id of the place to update.
 * @param {object} place - Place to create.
 * @param {string} [place.name] - Name of the place.
 * @param {number} [place.rating] - Rating given to the place (1 to 5).
 *
 * @returns {Promise<string>} Place's id
 */
const updateById = async (id, {
  name,
  rating,
}) => {
  try {
    await getKnex()(tables.place)
      .update({
        name,
        rating,
      })
      .where('id', id);

    return await getLastId();
  } catch (error) {
    getLogger().error('Error in updateById', {
      error,
    });
    throw error;
  }
};

/**
 * Delete a place.
 *
 * @param {string} id - Id of the place to delete.
 *
 * @returns {Promise<boolean>} Whether the place was deleted.
 */
const deleteById = async (id) => {
  try {
    const rowsAffected = await getKnex()(tables.place)
      .delete()
      .where('id', id);

    return rowsAffected > 0;
  } catch (error) {
    getLogger().error('Error in deleteById', {
      error,
    });
    throw error;
  }
};

module.exports = {
  findAll,
  findById,
  findByName,
  create,
  updateById,
  deleteById,
};

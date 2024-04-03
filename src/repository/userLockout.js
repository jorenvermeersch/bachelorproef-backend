const { tables, getKnex } = require('../data');

const create = async (userId) => {
  const [id] = await getKnex()(tables.userLockout).insert({
    user_id: userId,
  });

  return id;
};

const findByUserId = async (userId) => {
  const userLockout = await getKnex()(tables.userLockout)
    .where('user_id', userId)
    .first();

  if (!userLockout) {
    return;
  }

  const { id, user_id, failed_login_attempts, lockout_end_time } = userLockout;
  return {
    id,
    userId: user_id,
    failedLoginAttempts: failed_login_attempts,
    lockoutEndTime: lockout_end_time,
  };
};

const updateById = async (id, { failedLoginAttempts, lockoutEndTime }) => {
  await getKnex()(tables.userLockout)
    .update({
      failed_login_attempts: failedLoginAttempts,
      lockout_end_time: lockoutEndTime,
    })
    .where('id', id);
};

const resetById = async (id) => {
  await updateById(id, {
    failedLoginAttempts: 0,
    lockoutEndTime: null,
  });
};

module.exports = { create, findByUserId, updateById, resetById };

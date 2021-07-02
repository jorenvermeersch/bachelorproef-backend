const { shutdownData, getKnex, tables } = require('../src/data');

module.exports = async () => {
  // Remove test user
  await getKnex()(tables.user).where('id', '7f28c5f9-d711-4cd6-ac15-d13d71abff80').delete();

  // Close database connection
  await shutdownData();
};

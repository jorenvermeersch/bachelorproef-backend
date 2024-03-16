const { isPasswordBreached } = require('./dataBreach');
const { hashPassword, verifyPassword } = require('./hashing');

module.exports = { hashPassword, verifyPassword, isPasswordBreached };

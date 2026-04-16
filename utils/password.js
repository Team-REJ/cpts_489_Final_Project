const bcrypt = require('bcryptjs');
const { AUTH } = require('../config/constants');

function hash(plain) {
  return bcrypt.hash(plain, AUTH.BCRYPT_COST);
}

function compare(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

module.exports = { hash, compare };

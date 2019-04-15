const speakeasy = require('speakeasy');

function createKey() {
  return speakeasy.generateSecret({
    name: `otctrade`
  });
}

function authenticate(secret, token) {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token
  });
}

module.exports = {
  createKey,
  authenticate
};

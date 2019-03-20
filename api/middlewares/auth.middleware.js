const passport = require('passport');
const APIError = require('../utils/api-error');
const ROLES = require('../constants/roles');

const isLoggedin = passport.authenticate('jwt', { session: false });

// @TODO check group access
const hasRole = role => (req, res, next) => {
  if ((req.user && req.user.role === role) || req.user.role === 'ADMIN') {
    next();
  } else {
    throw new APIError('You are forbidden to access this resource', 403);
  }
};

const isAdmin = hasRole(ROLES.ADMIN);
const isUser = hasRole(ROLES.USER);

module.exports = {
  isLoggedin,
  isAdmin,
  isUser,
  hasRole
};

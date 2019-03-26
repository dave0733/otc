const passport = require('passport');
const APIError = require('../utils/api-error');
const ROLES = require('../constants/roles');
const GROUP_PERMISSION = require('../constants/group-permission');

const isLoggedin = passport.authenticate('jwt', { session: false });

// role based
const hasRole = role => (req, res, next) => {
  if ((req.user && req.user.role === role) || req.user.role === ROLES.ADMIN) {
    next();
  } else {
    next(new APIError('You are forbidden to access this resource', 403));
  }
};

const isAdmin = hasRole(ROLES.ADMIN);
const isUser = hasRole(ROLES.USER);

// group role based
const hasAccess = permission => (req, res, next) => {
  if (req.user.role === ROLES.ADMIN) {
    return next();
  }

  const perm = req.user.groups.find(g => g.group === req.group._id.toString());

  if (
    (perm && perm.permission === permission) ||
    perm.permission === GROUP_PERMISSION.ADMIN
  ) {
    return next();
  }

  return next(new APIError('You are forbidden to access this resource', 403));
};

const isGroupAdmin = hasAccess(GROUP_PERMISSION.ADMIN);
const isGroupMember = hasAccess(GROUP_PERMISSION.MEMBER);

// owner based
const isMe = (req, res, next) => {
  if (req.user._id === req.queryUser._id || req.user.role === ROLES.ADMIN) {
    return next();
  }

  return next(new APIError('You are forbidden to access this resource', 403));
};

module.exports = {
  isLoggedin,
  isAdmin,
  isUser,
  isMe,
  hasRole,
  hasAccess,
  isGroupAdmin,
  isGroupMember
};

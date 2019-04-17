const passport = require('passport');
const mongoose = require('mongoose');
const APIError = require('../utils/api-error');
const permUtils = require('../utils/permission');
const googleAuthenticator = require('../utils/google-authenticator');
const ROLES = require('../constants/roles');
const GROUP_PERMISSION = require('../constants/group-permission');
const config = require('../../config');

const User = mongoose.model('User');

const isLoggedin = passport.authenticate('jwt', { session: false });

// role based
const hasRole = role => (req, res, next) => {
  if (req.user.role === role || permUtils.isAdmin(req.user)) {
    next();
  } else {
    next(new APIError('You are forbidden to access this resource', 403));
  }
};

const isAdmin = hasRole(ROLES.ADMIN);
const isUser = hasRole(ROLES.USER);

// group role based
const hasAccess = permission => (req, res, next) => {
  if (permUtils.isAdmin(req.user)) {
    return next();
  }

  if (permUtils.hasAccess(req.user, req.group, permission)) {
    return next();
  }

  return next(new APIError('You are forbidden to access this resource', 403));
};

const isGroupAdmin = hasAccess(GROUP_PERMISSION.ADMIN);
const isGroupMember = hasAccess(GROUP_PERMISSION.MEMBER);
const hasGroupAccess = (req, res, next) => {
  if (permUtils.isAdmin(req.user)) {
    return next();
  }

  if (
    permUtils.isGroupAdmin(req.user, req.group) ||
    permUtils.isGroupMember(req.user, req.group)
  ) {
    return next();
  }

  return next(new APIError('You are forbidden to access this resource', 403));
};

// owner based
const isMe = (req, res, next) => {
  if (req.user._id === req.queryUser._id || permUtils.isAdmin(req.user)) {
    return next();
  }

  return next(new APIError('You are forbidden to access this resource', 403));
};

const is2FA = (required = true) => (req, res, next) => {
  if (permUtils.isAdmin(req.user)) {
    return next();
  }

  if (config.isDev) {
    return next();
  }

  return User.findById(req.user._id)
    .select('googleAuthenticator')
    .lean()
    .then(result => result && result.googleAuthenticator)
    .then(authToken => {
      if (!authToken) {
        if (required) {
          return next(
            new APIError(
              'Please set up 2FA in your account settings to continue.',
              403
            )
          );
        }

        return next();
      }

      if (
        !googleAuthenticator.authenticate(authToken, req.headers['2fa-auth'])
      ) {
        return next(new APIError('2FA failed', 403));
      }

      return next();
    });
};

module.exports = {
  isLoggedin,
  isAdmin,
  isUser,
  isMe,
  hasRole,
  hasAccess,
  hasGroupAccess,
  isGroupAdmin,
  isGroupMember,
  is2FA
};

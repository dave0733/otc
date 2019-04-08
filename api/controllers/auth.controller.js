const passport = require('passport');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const _ = require('lodash');
const config = require('../../config');
const APIError = require('../utils/api-error');
const firebase = require('../utils/firebase');
const AuthService = require('../services/auth.service');
const userService = require('../services/user.service');

const User = mongoose.model('User');

function register(req, res, next) {
  const { email, password } = req.body;

  const data = {
    ..._.pick(req.body, userService.fields),
    username: email
  };
  const user = new User(data);

  User.register(user, password, err => {
    if (err) {
      err.status = 400;
      return next(err);
    }

    return AuthService.sendVerificationEmail(email)
      .then(() => {
        res.send({ success: true });
      })
      .catch(e => {
        console.error('err', e);
        next(e);
      });
  });
}

function login(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new APIError('Email or password can not be empty', 401));
  }

  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      console.error(info);
      return next(err || new APIError('Email or password is wrong', 401));
    }

    req.login(user, { session: false }, err1 => {
      if (err1) {
        return next(err1);
      }

      if (!user.verified) {
        return next(new APIError('Your account is not verified yet.', 401));
      }

      const token = jwt.sign(user.toSafeJSON(), config.jwtSecret, {
        expiresIn: config.jwtExpiresIn
      });

      return firebase
        .generateToken({
          _id: user._id,
          role: user.role,
          groups: (user.groups || []).map(g => g.group)
        })
        .then(firebaseToken => {
          res.json({
            user: user.toSafeJSON(),
            token,
            firebaseToken
          });
        })
        .catch(err2 => next(err2));
    });
  })(req, res);
}

function refreshFirebaseToken(req, res, next) {
  const { user } = req;
  return firebase
    .generateToken({
      _id: user._id,
      role: user.role,
      groups: (user.groups || []).map(g => g.group)
    })
    .then(firebaseToken => {
      res.json({
        firebaseToken
      });
    })
    .catch(err => next(err));
}

function requestResetPassword(req, res, next) {
  AuthService.requestResetPassword(req.body.email)
    .then(() => {
      res.json({ success: true });
    })
    .catch(next);
}

function resetPassword(req, res, next) {
  const { email, token, password } = req.body;
  AuthService.resetPassword(email, token, password)
    .then(() => {
      res.json({ success: true });
    })
    .catch(next);
}

function sendVerificationEmail(req, res, next) {
  const { email } = req.body;
  return AuthService.sendVerificationEmail(email)
    .then(() => {
      res.json({ success: true });
    })
    .catch(err => next(err));
}

function verifyEmail(req, res, next) {
  const { token } = req.body;
  return AuthService.verifyEmailForUser(token)
    .then(() => {
      res.json({ success: true });
    })
    .catch(e => next(e));
}

module.exports = {
  login,
  register,
  requestResetPassword,
  refreshFirebaseToken,
  resetPassword,
  sendVerificationEmail,
  verifyEmail
};

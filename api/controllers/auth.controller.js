const passport = require('passport');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const mongoose = require('mongoose');
const config = require('../../config');
const APIError = require('../utils/api-error');
const AuthService = require('../services/auth.service');
const UserService = require('../services/user.service');

const User = mongoose.model('User');

function register(req, res, next) {
  const { nickname, email, firstName, lastName, password } = req.body;
  const user = new User({
    nickname,
    email,
    firstName,
    lastName,
    username: email
  });

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

      res.json({
        user: user.toSafeJSON(),
        token
      });
    });
  })(req, res);
}

function getProfile(req, res) {
  res.send(req.user);
}

function updateProfile(req, res, next) {
  User.findById(req.user.id)
    .then(user => {
      if (!user) {
        throw new APIError('User not found', 404);
      }

      return UserService.update(user, _.omit(req.body, ['role']));
    })
    .then(user => res.json(user))
    .catch(next);
}

function changePassword(req, res, next) {
  User.findById(req.user.id)
    .then(user => {
      if (!user) {
        throw new APIError('User not found', 404);
      }

      return UserService.changePassword(user, req.body);
    })
    .then(() => res.json({ success: true }))
    .catch(next);
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
  getProfile,
  updateProfile,
  changePassword,
  requestResetPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail
};

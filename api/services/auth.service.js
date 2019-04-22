const moment = require(`moment`);
const mongoose = require('mongoose');

const generateToken = require(`../utils/token`);
const config = require(`../../config`);
const mailer = require(`../utils/mailer`);
const APIError = require(`../utils/api-error`);
const MAIL_TYPES = require('../constants/mail-type');

const User = mongoose.model('User');

function requestResetPassword(email) {
  return User.findOne({
    email
  })
    .then(user => {
      if (!user) {
        throw new APIError('User not found', 404);
      }

      const token = generateToken(16);
      const expires = moment()
        .add(config.resetExpiresIn, 'hour')
        .toDate();

      user.resetToken = token;
      user.resetExpires = expires;

      return user.save();
    })
    .then(user => {
      return mailer.send(user, MAIL_TYPES.RESET_PASSWORD, {
        user
      });
    });
}

function resetPassword(email, token, password) {
  return User.findOne({
    email,
    resetToken: token
  })
    .then(user => {
      if (!user) {
        throw new APIError('User not found', 404);
      }

      if (moment().isAfter(user.resetExpires)) {
        throw new APIError('Your reset token is expired', 400);
      }

      return user.setPassword(password);
    })
    .then(user => {
      user.resetToken = null;
      user.resetExpires = null;
      user.lastPasswordChange = new Date();
      return user.save();
    });
}

function sendVerificationEmail(email) {
  return User.findOne({
    email
  })
    .then(user => {
      if (!user) {
        throw new APIError('User not found', 404);
      }

      user.verificationToken = generateToken(16);
      return user.save();
    })
    .then(user => {
      return mailer.send(user, MAIL_TYPES.VERIFICATION, {
        user
      });
    });
}

function verifyEmailForUser(token) {
  return User.findOne({
    verificationToken: token
  })
    .then(user => {
      if (!user) {
        throw new APIError('User not found', 404);
      }

      if (user.verified) {
        throw new APIError('User is already verified', 400);
      }

      user.verified = true;
      return user.save();
    })
    .then(user => {
      return mailer.send(user, MAIL_TYPES.WELCOME, {
        user
      });
    });
}

module.exports = {
  requestResetPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmailForUser
};

const mongoose = require('mongoose');
const BaseService = require('./BaseService');
const mailer = require('../utils/mailer');
const ROLES = require('../constants/roles');
const MAIL_TYPES = require('../constants/mail-type');

const User = mongoose.model('User');

class GuestService extends BaseService {
  contactUs({ email, firstName, lastName, inquiryType, message }) {
    return User.find({ role: ROLES.ADMIN })
      .select('email')
      .then(admins => {
        return mailer.send(admins, MAIL_TYPES.CONTACT_US, {
          email,
          firstName,
          lastName,
          inquiryType,
          message
        });
      });
  }
}

module.exports = new GuestService();

const moment = require('moment');
const mongoose = require('mongoose');
const mailer = require('../utils/mailer');
const notify = require('../utils/notify');
const OFFER_STATUS = require('../constants/offer-status');
const NOTIFICATION_TYPES = require('../constants/notification-type');
const MAIL_TYPES = require('../constants/mail-type');

const Offer = mongoose.model('Offer');
const User = mongoose.model('User');

function sendNotification(userIds, offer) {
  return User.find({
    _id: {
      $in: userIds
    }
  })
    .select('firstName lastName email avgRating')
    .then(users => {
      return mailer
        .send(users, MAIL_TYPES.OFFER_EXPIRED, {
          user: offer.offeredBy,
          offer
        })
        .then(() => users);
    })
    .then(users => {
      return Promise.all(
        users.map(user =>
          notify.send(user, NOTIFICATION_TYPES.OFFER.EXPIRED, {
            group: offer.group,
            user,
            offer
          })
        )
      );
    });
}

function checkExpiringOffer() {
  const now = moment().toDate();

  return Offer.find({
    expiresAt: {
      $lt: now
    },
    status: {
      $in: [OFFER_STATUS.ACTIVE, OFFER_STATUS.PENDING]
    }
  })
    .populate([
      { path: 'proposals', select: 'proposedBy' },
      { path: 'group', select: 'name' },
      { path: 'offeredBy' }
    ])
    .then(offers => {
      return Promise.all(
        offers.map(offer => {
          offer.status = OFFER_STATUS.EXPIRED;
          return offer.save();
        })
      ).then(() => offers);
    })
    .then(offers => {
      return Promise.all(
        offers.map(offer => {
          // const proposedBys = offer.proposals.map(p => p.proposedBy);
          const { offeredBy } = offer;

          return sendNotification([offeredBy], offer);
        })
      );
    });
}

module.exports = checkExpiringOffer;

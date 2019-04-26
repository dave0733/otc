const mongoose = require('mongoose');
const BaseCrudService = require('./BaseCrudService');
const APIError = require('../utils/api-error');
const mailer = require('../utils/mailer');
const notify = require('../utils/notify');
const VOUCH_STATUS = require('../constants/vouch-status');
const NOTIFICATION_TYPE = require('../constants/notification-type');
const MAIL_TYPES = require('../constants/mail-type');

// @TODO check against requestTo connection
class VouchService extends BaseCrudService {
  constructor() {
    super(
      'Vouch',
      ['note', 'requestedTo'],
      [],
      'requestedBy',
      ['offer', 'proposal', 'requestedBy', 'requestedTo'],
      [
        { path: 'offer' },
        { path: 'proposal' },
        { path: 'requestedBy' },
        { path: 'requestedTo' }
      ]
    );
    this.offerModel = mongoose.model('Offer');
    this.proposalModel = mongoose.model('Proposal');
    this.userModel = mongoose.model('User');
    this.acceptVouch = this.acceptVouch.bind(this);
    this.rejectVouch = this.rejectVouch.bind(this);
  }

  _notify({ to, type, user, group }) {
    return notify.send(to, type, {
      group: {
        id: group._id.toString(),
        name: group.name
      },
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  }

  create({ user, data, offerId, proposalId, group }) {
    let promise;

    if (!offerId && !proposalId) {
      return Promise.reject(
        new APIError('Offer or proposal should be specified for vouch', 400)
      );
    }

    if (offerId) {
      promise = this.offerModel.findById(offerId).then(offer => {
        if (!offer) {
          return Promise.reject(new APIError('Offer not found', 404));
        }

        if (!offer.offeredBy.equals(user._id)) {
          return Promise.reject(
            new APIError('You can only send vouch for your offer.', 403)
          );
        }
      });
    }

    if (proposalId) {
      promise = this.proposalModel.findById(proposalId).then(proposal => {
        if (!proposal) {
          return Promise.reject(new APIError('Proposal not found', 404));
        }

        if (!proposal.proposedBy.equals(user._id)) {
          return Promise.reject(
            new APIError('You can only send vouch for your proposal.', 403)
          );
        }
      });
    }

    return promise.then(() => {
      if (user._id.equals(data.requestedTo)) {
        return Promise.reject(
          new APIError('You can not send vouch to yourself.', 403)
        );
      }

      return super
        .create(user, data, {
          offer: offerId,
          proposal: proposalId,
          group: group._id
        })
        .then(vouch => {
          this._notify({
            to: data.requestedTo,
            type: NOTIFICATION_TYPE.VOUCH.RECEIVED,
            user,
            group
          });

          this.userModel
            .findById(vouch.requestedBy)
            .select('email')
            .then(u => {
              mailer.send(u, MAIL_TYPES.VOUCH_REQUEST_RECEIVED, {
                vouch,
                group
              });
            });

          return this.get(user, vouch._id);
        });
    });
  }

  remove(user, vouch) {
    return this.checkOwner(user, vouch).then(() => {
      if (vouch.status !== VOUCH_STATUS.PENDING) {
        throw new APIError('You can only update vouch while pending', 400);
      }

      return super.remove(user, vouch);
    });
  }

  acceptVouch({ user, vouch, group }) {
    return this.checkOwner(user, vouch, 'requestedTo')
      .then(() => {
        if (vouch.status !== VOUCH_STATUS.PENDING) {
          throw new APIError('You can only accept pending vouch.', 400);
        }

        vouch.status = VOUCH_STATUS.ACTIVE;
        return vouch.save();
      })
      .then(result => {
        if (result.offer) {
          result.offer.acceptedVouches = [
            ...result.offer.acceptedVouches,
            result._id
          ];
          return result.offer.save().then(() => result);
        }

        if (result.proposal) {
          result.proposal.acceptedVouches = [
            ...result.proposal.acceptedVouches,
            result._id
          ];
          return result.proposal.save().then(() => result);
        }

        return result;
      })
      .then(result => {
        this._notify({
          to: vouch.requestedBy,
          type: NOTIFICATION_TYPE.VOUCH.ACCEPTED,
          user,
          group
        });
        mailer.send(vouch.requestedBy, MAIL_TYPES.VOUCH_ACCEPTED, {
          vouch,
          group
        });
        return result;
      });
  }

  rejectVouch({ user, vouch, group }) {
    return this.checkOwner(user, vouch, 'requestedTo')
      .then(() => {
        if (vouch.status !== VOUCH_STATUS.PENDING) {
          throw new APIError('You can only reject pending vouch.', 400);
        }

        vouch.status = VOUCH_STATUS.REJECTED;
        return vouch.save();
      })
      .then(result => {
        this._notify({
          to: vouch.requestedBy,
          type: NOTIFICATION_TYPE.VOUCH.REJECTED,
          user,
          group
        });
        mailer.send(vouch.requestedBy, MAIL_TYPES.VOUCH_REJECTED, {
          vouch,
          group
        });
        return result;
      });
  }
}

module.exports = new VouchService();

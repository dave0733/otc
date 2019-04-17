const mongoose = require('mongoose');
const BaseCrudService = require('./BaseCrudService');
const APIError = require('../utils/api-error');
const notify = require('../utils/notify');
const VOUCH_STATUS = require('../constants/vouch-status');
const NOTIFICATION_TYPE = require('../constants/notification-type');

// @TODO check against requestTo connection
class VouchService extends BaseCrudService {
  constructor() {
    super(
      'Vouch',
      ['note', 'requestedTo'],
      [],
      'requestedBy',
      ['offer', 'requestedBy', 'requestedTo'],
      [
        { path: 'offer', select: 'have want' },
        { path: 'proposal', select: 'have want' },
        { path: 'requestedBy', select: 'firstName lastName avatar avgRating' },
        { path: 'requestedTo', select: 'firstName lastName avatar avgRating' }
      ]
    );
    this.offerModel = mongoose.model('Offer');
    this.proposalModel = mongoose.model('Proposal');
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
          return vouch;
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
        this._notify({
          to: vouch.requestedBy,
          type: NOTIFICATION_TYPE.VOUCH.ACCEPTED,
          user,
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
        return result;
      });
  }
}

module.exports = new VouchService();

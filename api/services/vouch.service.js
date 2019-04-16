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
      'offer'
    );
    this.offerModel = mongoose.model('Offer');
    this.acceptVouch = this.acceptVouch.bind(this);
    this.rejectVouch = this.rejectVouch.bind(this);
  }

  _notify(to, type, user, group, offer) {
    return notify.send(to, type, {
      group: {
        id: group._id.toString(),
        name: group.name
      },
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar
      },
      offer: {
        id: offer._id.toString(),
        have: offer.have,
        want: offer.want
      }
    });
  }

  create(user, data, offer, group) {
    if (!offer.offeredBy.equals(user._id)) {
      return Promise.reject(
        new APIError('You can only send vouch for your offer.', 403)
      );
    }

    if (user._id.equals(data.requestedTo)) {
      return Promise.reject(
        new APIError('You can not send vouch to yourself.', 403)
      );
    }

    return super.create(user, data, { offer: offer._id }).then(vouch =>
      this.offerModel
        .findOneAndUpdate(
          {
            _id: offer._id
          },
          {
            $push: {
              vouches: vouch._id
            }
          }
        )
        .then(() => {
          this._notify(
            data.requestedTo,
            NOTIFICATION_TYPE.VOUCH.RECEIVED,
            user,
            group,
            offer
          );
          return vouch;
        })
    );
  }

  remove(user, vouch) {
    return this.checkOwner(user, vouch)
      .then(() => {
        if (vouch.status !== VOUCH_STATUS.PENDING) {
          throw new APIError('You can only update vouch while pending', 400);
        }

        return super.remove(user, vouch);
      })
      .then(() =>
        this.offerModel.findOneAndUpdate(
          {
            _id: vouch.offer
          },
          {
            $pull: {
              vouches: vouch._id
            }
          }
        )
      );
  }

  acceptVouch({ user, vouch, group, offer }) {
    return this.checkOwner(user, vouch, 'requestedTo')
      .then(() => {
        if (vouch.status !== VOUCH_STATUS.PENDING) {
          throw new APIError('You can only accept pending vouch.', 400);
        }

        vouch.status = VOUCH_STATUS.ACTIVE;
        return vouch.save();
      })
      .then(result => {
        this._notify(
          vouch.requestedBy,
          NOTIFICATION_TYPE.VOUCH.ACCEPTED,
          user,
          group,
          offer
        );
        return result;
      });
  }

  rejectVouch({ user, vouch, group, offer }) {
    return this.checkOwner(vouch, 'requestedTo')
      .then(() => {
        if (vouch.status !== VOUCH_STATUS.PENDING) {
          throw new APIError('You can only reject pending vouch.', 400);
        }

        vouch.status = VOUCH_STATUS.REJECTED;
        return vouch.save();
      })
      .then(result => {
        this._notify(
          vouch.requestedBy,
          NOTIFICATION_TYPE.VOUCH.REJECTED,
          user,
          group,
          offer
        );
        return result;
      });
  }
}

module.exports = new VouchService();

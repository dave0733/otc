const mongoose = require('mongoose');
const BaseCrudService = require('./BaseCrudService');
const APIError = require('../utils/api-error');
const VOUCH_STATUS = require('../constants/vouch-status');

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

  create(data, offer) {
    if (!offer.offeredBy.equals(this.currentUser.id)) {
      return Promise.reject(
        new APIError('You can only send vouch for your offer.', 403)
      );
    }

    if (this.currentUser.id === data.requestedTo) {
      return Promise.reject(
        new APIError('You can not send vouch to yourself.', 403)
      );
    }

    return super.create(data, { offer: offer._id }).then(vouch =>
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
        .then(() => vouch)
    );
  }

  remove(vouch) {
    return this.checkOwner(vouch)
      .then(() => {
        if (vouch.status !== VOUCH_STATUS.PENDING) {
          throw new APIError('You can only update vouch while pending', 400);
        }

        return super.remove(vouch);
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

  acceptVouch(vouch) {
    return this.checkOwner(vouch, 'requestedTo').then(() => {
      if (vouch.status !== VOUCH_STATUS.PENDING) {
        throw new APIError('You can only accept pending vouch.', 400);
      }

      vouch.status = VOUCH_STATUS.ACTIVE;
      return vouch.save();
    });
  }

  rejectVouch(vouch) {
    return this.checkOwner(vouch, 'requestedTo').then(() => {
      if (vouch.status !== VOUCH_STATUS.PENDING) {
        throw new APIError('You can only reject pending vouch.', 400);
      }

      vouch.status = VOUCH_STATUS.REJECTED;
      return vouch.save();
    });
  }
}

module.exports = new VouchService();

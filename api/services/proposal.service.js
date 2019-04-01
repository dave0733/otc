const mongoose = require('mongoose');
const BaseCrudService = require('./BaseCrudService');
const APIError = require('../utils/api-error');
const PROPOSAL_STATUS = require('../constants/proposal-status');

class ProposalService extends BaseCrudService {
  constructor() {
    super(
      'Proposal',
      ['have', 'want', 'note'],
      [],
      'proposedBy',
      ['offer', 'proposedBy'],
      'offer'
    );

    this.offerModel = mongoose.model('Offer');
  }

  create(data, offer) {
    if (offer.offeredBy.equals(this.currentUser.id)) {
      return Promise.reject(
        new APIError('You can not send proposal to your offer.', 403)
      );
    }

    return super.create(data, { offer: offer._id }).then(proposal =>
      this.offerModel
        .findOneAndUpdate(
          {
            _id: offer._id
          },
          {
            $push: {
              proposals: proposal
            }
          }
        )
        .then(() => proposal)
    );
  }

  update(proposal, data) {
    return this.checkOwner(proposal).then(() => {
      if (proposal.status !== PROPOSAL_STATUS.PENDING) {
        throw new APIError('You can only update proposal while pending', 400);
      }

      return super.update(proposal, data);
    });
  }

  remove(proposal) {
    return this.checkOwner(proposal)
      .then(() => {
        if (proposal.status !== PROPOSAL_STATUS.PENDING) {
          throw new APIError('You can only delete proposal while pending', 400);
        }

        return super.remove(proposal);
      })
      .then(() =>
        this.offerModel.findOneAndUpdate(
          {
            _id: proposal.offer
          },
          {
            $pull: {
              proposals: proposal._id
            }
          }
        )
      );
  }
}

module.exports = new ProposalService();

const mongoose = require('mongoose');
const BaseCrudService = require('./BaseCrudService');
const APIError = require('../utils/api-error');
const notify = require('../utils/notify');
const vouchService = require('./vouch.service');
const PROPOSAL_STATUS = require('../constants/proposal-status');
const NOTIFICATION_TYPE = require('../constants/notification-type');

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

  _notify(to, type, user, group, offer, proposal) {
    return notify.send(to, type, {
      group: {
        id: group._id.toString(),
        name: group.name
      },
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName
      },
      offer: {
        id: offer._id.toString(),
        have: offer.have,
        want: offer.want
      },
      proposal: {
        id: proposal._id.toString(),
        have: proposal.have,
        want: proposal.want
      }
    });
  }

  create(user, data, offer, group) {
    if (offer.offeredBy.equals(user._id)) {
      return Promise.reject(
        new APIError('You can not send proposal to your offer.', 403)
      );
    }

    return super.create(user, data, { offer: offer._id }).then(proposal =>
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
        .then(() => {
          this._notify(
            offer.offeredBy,
            NOTIFICATION_TYPE.PROPOSAL.RECEIVED,
            user,
            group,
            offer,
            proposal
          );
          return proposal;
        })
    );
  }

  update(user, proposal, data) {
    return this.checkOwner(user, proposal).then(() => {
      if (proposal.status !== PROPOSAL_STATUS.PENDING) {
        throw new APIError('You can only update proposal while pending', 400);
      }

      return super.update(user, proposal, data);
    });
  }

  remove(user, proposal) {
    return this.checkOwner(user, proposal)
      .then(() => {
        if (proposal.status !== PROPOSAL_STATUS.PENDING) {
          throw new APIError('You can only delete proposal while pending', 400);
        }

        return super.remove(user, proposal);
      })
      .then(() =>
        Promise.all([
          this.offerModel.findOneAndUpdate(
            {
              _id: proposal.offer
            },
            {
              $pull: {
                proposals: proposal._id
              }
            }
          ),
          this.vouchModel.deleteMany({
            proposal: proposal._id
          })
        ])
      );
  }

  getVouches(user, proposal, filters, sort, skip, limit) {
    const newFilters = filters || {};

    newFilters.proposal = proposal._id;

    return vouchService.list(user, newFilters, sort, skip, limit, true, [
      { path: 'requestedTo' },
      { path: 'proposal', select: 'have want status' }
    ]);
  }
}

module.exports = new ProposalService();

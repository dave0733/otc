const BaseCrudService = require('./BaseCrudService');
const vouchService = require('./vouch.service');
const proposalService = require('./proposal.service');
const userService = require('./user.service');
const APIError = require('../utils/api-error');
const OFFER_STATUS = require('../constants/offer-status');
const PROPOSAL_STATUS = require('../constants/proposal-status');

class OfferService extends BaseCrudService {
  constructor() {
    super('Offer', ['have', 'want', 'note', 'expiresAt'], [], 'offeredBy', [
      'offeredBy',
      'activeProposal',
      'counterpart'
    ]);

    this.setGroup = this.setGroup.bind(this);
    this.endListing = this.endListing.bind(this);
    this.leaveFeedbackToProposal = this.leaveFeedbackToProposal.bind(this);
    this.leaveFeedbackToOffer = this.leaveFeedbackToOffer.bind(this);
    this.acceptProposal = this.acceptProposal.bind(this);
    this.rejectProposal = this.rejectProposal.bind(this);
    this.getVouches = this.getVouches.bind(this);
    this.getProposals = this.getProposals.bind(this);
  }

  setGroup(group) {
    this.group = group;
  }

  update(offer, data) {
    return this.checkOwner(offer).then(() => {
      if (offer.status !== OFFER_STATUS.PENDING) {
        throw new APIError('You can not update offer once it is active', 400);
      }

      return super.update(offer, data);
    });
  }

  remove(offer) {
    return this.checkOwner(offer).then(() => {
      if (offer.status !== OFFER_STATUS.PENDING) {
        throw new APIError('You can not delete offer once it is active', 400);
      }

      return super.remove(offer);
    });
  }

  _listWhere(filters = {}) {
    const where = super._listWhere(filters);
    delete where[this.userIdField];

    where.group = this.group._id;

    return where;
  }

  endListing(offer) {
    return this.checkOwner(offer).then(() => {
      if (offer.status !== OFFER_STATUS.ACTIVE) {
        throw new APIError('You can only end an active offer.', 400);
      }

      offer.status = OFFER_STATUS.ENDED;
      return offer.save();
    });
  }

  leaveFeedbackToProposal(offer, feedback) {
    return this.checkOwner(offer)
      .then(() => {
        if (offer.status !== OFFER_STATUS.ENDED) {
          throw new APIError(
            'You can only leave feedback once it is ended',
            400
          );
        }

        if (offer.feedbackToProposal) {
          throw new APIError('You can only leave feedback once', 400);
        }

        offer.feedbackToProposal = feedback;
        return offer.save();
      })
      .then(() => userService.updateFeedback(offer.counterpart, feedback))
      .then(() => offer);
  }

  leaveFeedbackToOffer(offer, feedback) {
    return this.checkOwner(offer, 'counterpart')
      .then(() => {
        if (offer.status !== OFFER_STATUS.ENDED) {
          throw new APIError(
            'You can only leave feedback once it is ended',
            400
          );
        }

        if (offer.feedbackToOffer) {
          throw new APIError('You can only leave feedback once', 400);
        }

        offer.feedbackToOffer = feedback;
        return offer.save();
      })
      .then(() => userService.updateFeedback(offer.offeredBy, feedback))
      .then(() => offer);
  }

  acceptProposal(offer, proposal) {
    return this.checkOwner(offer).then(() => {
      if (offer.status !== OFFER_STATUS.PENDING) {
        throw new APIError(
          'You can only accept proposal when while offer is pending.',
          400
        );
      }

      if (offer.acceptedProposal) {
        throw new APIError('You already accepted a proposal.', 400);
      }

      if (proposal.status !== PROPOSAL_STATUS.PENDING) {
        throw new APIError('You can only reject pending proposal.', 400);
      }

      offer.acceptedProposal = proposal;
      offer.counterpart = proposal.proposedBy;
      offer.status = OFFER_STATUS.ACTIVE;

      proposal.status = PROPOSAL_STATUS.ACTIVE;

      return Promise.all([offer.save(), proposal.save()]).then(() => offer);
    });
  }

  rejectProposal(offer, proposal) {
    return this.checkOwner(offer).then(() => {
      if (
        offer.status !== OFFER_STATUS.PENDING &&
        offer.status !== OFFER_STATUS.ACTIVE
      ) {
        throw new APIError(
          'You can only reject proposal when while offer is pending or active.',
          400
        );
      }

      if (proposal.status !== PROPOSAL_STATUS.PENDING) {
        throw new APIError('You can only reject pending proposal.', 400);
      }

      proposal.status = PROPOSAL_STATUS.REJECTED;

      return proposal.save().then(() => offer);
    });
  }

  getVouches(offer, filters, sort, skip, limit) {
    const newFilters = filters || {};
    if (!this._isOwner(offer)) {
      newFilters.requestedTo = this.currentUser._id;
    }

    newFilters.offer = offer._id;

    vouchService.setCurrentUser(this.currentUser);

    return vouchService.list(newFilters, sort, skip, limit);
  }

  getProposals(offer, filters, sort, skip, limit) {
    const newFilters = filters || {};
    if (!this._isOwner(offer)) {
      newFilters.proposedBy = this.currentUser._id;
    }

    newFilters.offer = offer._id;

    proposalService.setCurrentUser(this.currentUser);

    return proposalService.list(newFilters, sort, skip, limit);
  }
}

module.exports = new OfferService();

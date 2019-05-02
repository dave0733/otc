const mongoose = require('mongoose');
const BaseCrudService = require('./BaseCrudService');
const vouchService = require('./vouch.service');
const proposalService = require('./proposal.service');
const userService = require('./user.service');
const APIError = require('../utils/api-error');
const notify = require('../utils/notify');
const mailer = require('../utils/mailer');
const messageService = require('./message.service');
const groupService = require('./group.service');
const OFFER_STATUS = require('../constants/offer-status');
const PROPOSAL_STATUS = require('../constants/proposal-status');
const MESSAGE_TYPE = require('../constants/message-type');
const NOTIFICATION_TYPE = require('../constants/notification-type');
const MAIL_TYPES = require('../constants/mail-type');

class OfferService extends BaseCrudService {
  constructor() {
    super('Offer', ['have', 'want', 'note', 'expiresAt'], [], 'offeredBy', [
      'offeredBy',
      'activeProposal',
      'counterpart'
    ]);
    this.vouchModel = mongoose.model('Vouch');
    this.proposalModel = mongoose.model('Proposal');
    this.endListing = this.endListing.bind(this);
    this.leaveFeedbackToProposal = this.leaveFeedbackToProposal.bind(this);
    this.leaveFeedbackToOffer = this.leaveFeedbackToOffer.bind(this);
    this.acceptProposal = this.acceptProposal.bind(this);
    this.rejectProposal = this.rejectProposal.bind(this);
    this.getVouches = this.getVouches.bind(this);
    this.getProposals = this.getProposals.bind(this);
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
        lastName: user.lastName
      },
      offer: {
        id: offer._id.toString(),
        have: offer.have,
        want: offer.want
      }
    });
  }

  create(user, group, data) {
    return super.create(user, data, { group: group._id }).then(offer => {
      messageService._createSystemMessage(
        group.chat.toString(),
        MESSAGE_TYPE.OFFER,
        {
          id: offer._id.toString(),
          have: offer.have,
          want: offer.want,
          note: offer.note || null
        }
      );

      groupService
        .getAllMembers(user, group._id, {}, [], 0, 10000)
        .then(members => {
          mailer.send(members.data, MAIL_TYPES.OFFER_CREATED, {
            offer,
            group,
            user
          });
        });
      return offer;
    });
  }

  update(user, offer, data) {
    return this.checkOwner(user, offer).then(() => {
      if (offer.status !== OFFER_STATUS.PENDING) {
        throw new APIError('You can not update offer once it is active', 400);
      }

      return super.update(user, offer, data);
    });
  }

  remove(user, offer) {
    return this.checkOwner(user, offer)
      .then(() => {
        if (offer.status !== OFFER_STATUS.PENDING) {
          throw new APIError('You can not delete offer once it is active', 400);
        }

        return super.remove(user, offer);
      })
      .then(() =>
        Promise.all([
          this.vouchModel.deleteMany({
            offer: offer._id
          }),
          this.proposalModel.deleteMany({
            offer: offer._id
          })
        ])
      );
  }

  _listWhere(user, filters = {}) {
    const where = super._listWhere(user, filters);
    if (!filters[this.userIdField]) {
      delete where[this.userIdField];
    } else {
      where[this.userIdField] = filters[this.userIdField];
    }

    return where;
  }

  endListing({ user, offer, group }) {
    return this.checkOwner(user, offer)
      .then(() => {
        if (offer.status !== OFFER_STATUS.ACTIVE) {
          throw new APIError('You can only end an active offer.', 400);
        }

        offer.status = OFFER_STATUS.ENDED;
        return offer.save();
      })
      .then(result => {
        this.getProposals(user, offer).then(proposals => {
          proposals.data.forEach(p => {
            this._notify(
              p.proposedBy,
              NOTIFICATION_TYPE.OFFER.ENDED,
              user,
              group,
              offer
            );
          });
          mailer.send(offer.offeredBy, MAIL_TYPES.OFFER_ENDED, {
            group,
            offer,
            user: offer.offeredBy
          });
          mailer.send(
            proposals.data.map(p => p.proposedBy),
            MAIL_TYPES.OFFER_ENDED,
            {
              group,
              offer,
              user: offer.offeredBy
            }
          );
        });
        return result;
      });
  }

  leaveFeedbackToProposal({ user, offer, feedback, group }) {
    return this.checkOwner(user, offer)
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
      .then(() => {
        this._notify(
          offer.counterpart,
          NOTIFICATION_TYPE.PROPOSAL.FEEDBACK,
          user,
          group,
          offer
        );
        mailer.send(offer.counterpart, MAIL_TYPES.PROPOSAL_FEEDBACK, {
          offer,
          group
        });
        return offer;
      });
  }

  leaveFeedbackToOffer({ user, offer, feedback, group }) {
    return this.checkOwner(user, offer, 'counterpart')
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
      .then(() => {
        this._notify(
          offer.offeredBy,
          NOTIFICATION_TYPE.OFFER.FEEDBACK,
          user,
          group,
          offer
        );
        mailer.send(offer.offeredBy, MAIL_TYPES.OFFER_FEEDBACK, {
          offer,
          group
        });

        return offer;
      });
  }

  acceptProposal({ user, offer, proposal, group }) {
    return this.checkOwner(user, offer).then(() => {
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

      return Promise.all([offer.save(), proposal.save()]).then(() => {
        this._notify(
          proposal.proposedBy,
          NOTIFICATION_TYPE.PROPOSAL.ACCEPTED,
          user,
          group,
          offer
        );
        mailer.send(proposal.proposedBy, MAIL_TYPES.PROPOSAL_ACCEPTED, {
          group
        });
        return offer;
      });
    });
  }

  rejectProposal({ user, offer, proposal, group }) {
    return this.checkOwner(user, offer).then(() => {
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

      return proposal.save().then(() => {
        this._notify(
          proposal.proposedBy,
          NOTIFICATION_TYPE.PROPOSAL.REJECTED,
          user,
          group,
          offer
        );
        mailer.send(proposal.proposedBy, MAIL_TYPES.PROPOSAL_REJECTED, {
          group
        });
        return offer;
      });
    });
  }

  getVouches(user, offer, filters, sort, skip, limit) {
    const newFilters = filters || {};

    newFilters.offer = offer._id;

    return vouchService.list(user, newFilters, sort, skip, limit, true, [
      { path: 'requestedTo' },
      { path: 'offer', select: 'have want status' }
    ]);
  }

  getProposals(user, offer, filters, sort, skip, limit) {
    const newFilters = filters || {};
    if (!this._isOwner(user, offer)) {
      newFilters.proposedBy = user._id;
    }

    newFilters.offer = offer._id;

    return proposalService.list(user, newFilters, sort, skip, limit, true, [
      { path: 'proposedBy' },
      { path: 'offer', select: 'have want status' }
    ]);
  }
}

module.exports = new OfferService();

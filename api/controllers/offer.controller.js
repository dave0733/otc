const _ = require('lodash');
const BaseCrudController = require('./BaseCrudController');
const offerService = require('../services/offer.service');

class OfferController extends BaseCrudController {
  constructor() {
    super(offerService, 'offer');

    this.endListing = this.endListing.bind(this);
    this.leaveFeedbackToProposal = this.leaveFeedbackToProposal.bind(this);
    this.leaveFeedbackToOffer = this.leaveFeedbackToOffer.bind(this);
    this.acceptProposal = this.acceptProposal.bind(this);
    this.rejectProposal = this.rejectProposal.bind(this);
    this.getVouches = this.getVouches.bind(this);
    this.getProposals = this.getProposals.bind(this);
    this.listMyOffers = this.listMyOffers.bind(this);
    this.listFeedback = this.listFeedback.bind(this);
  }

  create(req, res, next) {
    return this.dataService
      .create(req.user, req.group, req.body)
      .then(item => res.json(item))
      .catch(next);
  }

  list(req, res, next) {
    req.query.filters = req.query.filters || {};
    req.query.filters.group = req.group._id;

    return super.list(req, res, next);
  }

  listMyOffers(req, res, next) {
    req.query.filters = req.query.filters || {};
    req.query.filters.offeredBy = req.user._id;
    return super.list(req, res, next);
  }

  listFeedback(req, res, next) {
    return this.dataService
      .list(
        req.user,
        {
          status: 'ENDED',
          feedbackToOffer: {
            $exists: true
          },
          feedbackToProposal: {
            $exists: true
          },
          $or: [{ offeredBy: req.user._id }, { counterpart: req.user._id }]
        },
        req.query.sorts,
        req.query.skip,
        req.query.limit,
        true,
        [
          { path: 'group', select: 'name' },
          { path: 'offeredBy', select: 'firstName lastName' },
          { path: 'counterpart', select: 'firstName lastName' }
        ],
        'group offeredBy feedbackToOffer feedbackToProposal counterpart updatedAt createdAt'
      )
      .then(result => res.json(result))
      .catch(next);
  }

  leaveFeedbackToProposal(req, res, next) {
    const feedback = _.pick(req.body, ['timeline', 'communication', 'comment']);
    return this.dataService
      .leaveFeedbackToProposal({
        user: req.user,
        offer: req.offer,
        feedback,
        group: req.group
      })
      .then(result => res.json(result))
      .catch(next);
  }

  leaveFeedbackToOffer(req, res, next) {
    const feedback = _.pick(req.body, ['timeline', 'communication', 'comment']);
    return this.dataService
      .leaveFeedbackToOffer({
        user: req.user,
        offer: req.offer,
        feedback,
        group: req.group
      })
      .then(result => res.json(result))
      .catch(next);
  }

  endListing(req, res, next) {
    return this.dataService
      .endListing({
        user: req.user,
        offer: req.offer,
        group: req.group
      })
      .then(result => res.json(result))
      .catch(next);
  }

  acceptProposal(req, res, next) {
    return this.dataService
      .acceptProposal({
        user: req.user,
        offer: req.offer,
        proposal: req.proposal,
        group: req.group
      })
      .then(result => res.json(result))
      .catch(next);
  }

  rejectProposal(req, res, next) {
    return this.dataService
      .rejectProposal({
        user: req.user,
        offer: req.offer,
        proposal: req.proposal,
        group: req.group
      })
      .then(result => res.json(result))
      .catch(next);
  }

  getVouches(req, res, next) {
    return this.dataService
      .getVouches(
        req.user,
        req.offer,
        req.query.filters,
        req.query.sorts,
        req.query.skip,
        req.query.limit
      )
      .then(items => res.json(items))
      .catch(next);
  }

  getProposals(req, res, next) {
    return this.dataService
      .getProposals(
        req.user,
        req.offer,
        req.query.filters,
        req.query.sorts,
        req.query.skip,
        req.query.limit
      )
      .then(items => res.json(items))
      .catch(next);
  }
}

module.exports = new OfferController();

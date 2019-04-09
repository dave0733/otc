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
  }

  create(req, res, next) {
    return this.dataService
      .create(req.user, req.body, { group: req.group._id })
      .then(item => res.json(item))
      .catch(next);
  }

  list(req, res, next) {
    req.query.filters = req.query.filters || {};
    req.query.filters.group = req.group._id;

    return super.list(req, res, next);
  }

  leaveFeedbackToProposal(req, res, next) {
    const feedback = _.pick(req.body, ['timeline', 'communication', 'comment']);
    return this.dataService
      .leaveFeedbackToProposal(req.user, req.offer, feedback)
      .then(result => res.json(result))
      .catch(next);
  }

  leaveFeedbackToOffer(req, res, next) {
    const feedback = _.pick(req.body, ['timeline', 'communication', 'comment']);
    return this.dataService
      .leaveFeedbackToOffer(req.user, req.offer, feedback)
      .then(result => res.json(result))
      .catch(next);
  }

  endListing(req, res, next) {
    return this.dataService
      .endListing(req.user, req.offer)
      .then(result => res.json(result))
      .catch(next);
  }

  acceptProposal(req, res, next) {
    return this.dataService
      .acceptProposal(req.user, req.offer, req.proposal)
      .then(result => res.json(result))
      .catch(next);
  }

  rejectProposal(req, res, next) {
    return this.dataService
      .rejectProposal(req.user, req.offer, req.proposal)
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

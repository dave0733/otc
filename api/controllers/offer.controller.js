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
    this.dataService.setCurrentUser(req.user);

    return this.dataService
      .create(req.body, { group: req.group._id })
      .then(item => res.json(item))
      .catch(next);
  }

  list(req, res, next) {
    this.dataService.setGroup(req.group);

    return super.list(req, res, next);
  }

  leaveFeedbackToProposal(req, res, next) {
    this.dataService.setCurrentUser(req.user);
    const feedback = _.pick(req.body, ['timeline', 'communication', 'comment']);
    return this.dataService
      .leaveFeedbackToProposal(req.offer, feedback)
      .then(result => res.json(result))
      .catch(next);
  }

  leaveFeedbackToOffer(req, res, next) {
    this.dataService.setCurrentUser(req.user);
    const feedback = _.pick(req.body, ['timeline', 'communication', 'comment']);
    return this.dataService
      .leaveFeedbackToOffer(req.offer, feedback)
      .then(result => res.json(result))
      .catch(next);
  }

  endListing(req, res, next) {
    this.dataService.setCurrentUser(req.user);
    return this.dataService
      .endListing(req.offer)
      .then(result => res.json(result))
      .catch(next);
  }

  acceptProposal(req, res, next) {
    this.dataService.setCurrentUser(req.user);
    return this.dataService
      .acceptProposal(req.offer, req.proposal)
      .then(result => res.json(result))
      .catch(next);
  }

  rejectProposal(req, res, next) {
    this.dataService.setCurrentUser(req.user);
    return this.dataService
      .rejectProposal(req.offer, req.proposal)
      .then(result => res.json(result))
      .catch(next);
  }

  getVouches(req, res, next) {
    this.dataService.setCurrentUser(req.user);

    return this.dataService
      .getVouches(
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
    this.dataService.setCurrentUser(req.user);

    return this.dataService
      .getProposals(
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

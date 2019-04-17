const BaseCrudController = require('./BaseCrudController');
const proposalService = require('../services/proposal.service');

class ProposalController extends BaseCrudController {
  constructor() {
    super(proposalService, 'proposal');
    this.getVouches = this.getVouches.bind(this);
  }

  create(req, res, next) {
    return this.dataService
      .create(req.user, req.body, req.offer, req.group)
      .then(item => res.json(item))
      .catch(next);
  }

  getVouches(req, res, next) {
    return this.dataService
      .getVouches(
        req.user,
        req.proposal,
        req.query.filters,
        req.query.sorts,
        req.query.skip,
        req.query.limit
      )
      .then(items => res.json(items))
      .catch(next);
  }
}

module.exports = new ProposalController();

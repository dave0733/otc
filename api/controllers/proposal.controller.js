const BaseCrudController = require('./BaseCrudController');
const proposalService = require('../services/proposal.service');

class ProposalController extends BaseCrudController {
  constructor() {
    super(proposalService, 'proposal');
  }

  create(req, res, next) {
    return this.dataService
      .create(req.user, req.body, req.offer, req.group)
      .then(item => res.json(item))
      .catch(next);
  }
}

module.exports = new ProposalController();

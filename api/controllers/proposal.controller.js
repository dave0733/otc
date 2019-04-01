const BaseCrudController = require('./BaseCrudController');
const proposalService = require('../services/proposal.service');

class ProposalController extends BaseCrudController {
  constructor() {
    super(proposalService, 'proposal');
  }

  create(req, res, next) {
    this.dataService.setCurrentUser(req.user);

    return this.dataService
      .create(req.body, req.offer)
      .then(item => res.json(item))
      .catch(next);
  }
}

module.exports = new ProposalController();

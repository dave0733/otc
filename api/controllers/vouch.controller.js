const BaseCrudController = require('./BaseCrudController');
const vouchService = require('../services/vouch.service');

class VouchController extends BaseCrudController {
  constructor() {
    super(vouchService, 'vouch');
    this.acceptVouch = this.acceptVouch.bind(this);
    this.rejectVouch = this.rejectVouch.bind(this);
  }

  create(req, res, next) {
    this.dataService.setCurrentUser(req.user);

    return this.dataService
      .create(req.body, req.offer)
      .then(item => res.json(item))
      .catch(next);
  }

  acceptVouch(req, res, next) {
    this.dataService.setCurrentUser(req.user);
    return this.dataService
      .acceptVouch(req.vouch)
      .then(result => res.json(result))
      .catch(next);
  }

  rejectVouch(req, res, next) {
    this.dataService.setCurrentUser(req.user);
    return this.dataService
      .rejectVouch(req.vouch)
      .then(result => res.json(result))
      .catch(next);
  }
}

module.exports = new VouchController();

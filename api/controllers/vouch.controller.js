const BaseCrudController = require('./BaseCrudController');
const vouchService = require('../services/vouch.service');

class VouchController extends BaseCrudController {
  constructor() {
    super(vouchService, 'vouch');
    this.acceptVouch = this.acceptVouch.bind(this);
    this.rejectVouch = this.rejectVouch.bind(this);
    this.listRequestedVouches = this.listRequestedVouches.bind(this);
  }

  listRequestedVouches(req, res, next) {
    return this.dataService
      .list(
        req.user,
        {
          requestedTo: req.user._id
        },
        req.query.sorts,
        req.query.skip,
        req.query.limit,
        true
      )
      .then(result => res.json(result))
      .catch(next);
  }

  create(req, res, next) {
    return this.dataService
      .create(req.user, req.body, req.offer, req.group)
      .then(item => res.json(item))
      .catch(next);
  }

  acceptVouch(req, res, next) {
    return this.dataService
      .acceptVouch({
        user: req.user,
        vouch: req.vouch,
        offer: req.offer,
        group: req.group
      })
      .then(result => res.json(result))
      .catch(next);
  }

  rejectVouch(req, res, next) {
    return this.dataService
      .rejectVouch({
        user: req.user,
        vouch: req.vouch,
        offer: req.offer,
        group: req.group
      })
      .then(result => res.json(result))
      .catch(next);
  }
}

module.exports = new VouchController();

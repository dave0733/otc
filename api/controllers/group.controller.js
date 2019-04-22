const BaseCrudController = require('./BaseCrudController');
const groupService = require('../services/group.service');

class GroupController extends BaseCrudController {
  constructor() {
    super(groupService, 'group');

    this.getAllMembers = this.getAllMembers.bind(this);
    this.getMembers = this.getMembers.bind(this);
  }

  getMembers(req, res, next) {
    return this.dataService
      .getMembers(
        req.user,
        req.group._id,
        req.query.filters,
        req.query.sorts,
        req.query.skip,
        req.query.limit
      )
      .then(items => res.json(items))
      .catch(next);
  }

  getAllMembers(req, res, next) {
    return this.dataService
      .getAllMembers(
        req.user,
        req.group._id,
        req.query.filters,
        req.query.sorts,
        req.query.skip,
        req.query.limit
      )
      .then(items => res.json(items))
      .catch(next);
  }
}

module.exports = new GroupController();

const BaseCrudController = require('./BaseCrudController');
const groupService = require('../services/group.service');

class GroupController extends BaseCrudController {
  constructor() {
    super(groupService, 'group');

    this.getMembers = this.getMembers.bind(this);
  }

  getMembers(req, res, next) {
    this.dataService.setCurrentUser(req.user);

    return this.dataService
      .getMembers(
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

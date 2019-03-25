const BaseCrudService = require('./BaseCrudService');
const userService = require('./user.service');

class GroupService extends BaseCrudService {
  constructor() {
    super('Group', ['name', 'description', 'rules'], ['status'], 'createdBy');
  }

  getMembers(groupid, filters, sorts, skip, limit) {
    return userService.list(
      {
        ...filters,
        'groups.group': groupid
      },
      sorts,
      skip,
      limit
    );
  }
}

module.exports = new GroupService();

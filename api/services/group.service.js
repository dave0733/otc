const BaseCrudService = require('./BaseCrudService');
const userService = require('./user.service');
const APIError = require('../utils/api-error');
const permissionService = require('./permission.service');
const chatService = require('./chat.service');
const GROUP_PERMISSION = require('../constants/group-permission');
const GROUP_STATUS = require('../constants/group-status');

class GroupService extends BaseCrudService {
  constructor() {
    super(
      'Group',
      ['name', 'description', 'rules', 'closed'],
      ['status'],
      'createdBy'
    );
  }

  _listWhere(filters = {}) {
    const where = super._listWhere(filters);
    delete where[this.userIdField];

    // force listing with status
    if (!this._isAdmin()) {
      where.status = GROUP_STATUS.ACTIVE;
    }

    return where;
  }

  create(data) {
    return super.create(data).then(group => {
      return permissionService
        .addPermission(this.currentUser, group, GROUP_PERMISSION.ADMIN, true)
        .then(() => chatService.createGroupChat(group))
        .then(() => group);
    });
  }

  get(id) {
    return super.get(id).then(group => {
      if (
        group.status !== GROUP_STATUS.ACTIVE &&
        !this._isAdmin() &&
        !this._isGroupAdmin(group)
      ) {
        throw new APIError('Not found', 404);
      }

      return group;
    });
  }

  getMembers(groupid, filters = {}, sorts, skip, limit) {
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

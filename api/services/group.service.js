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

  _listWhere(user, filters = {}) {
    const where = super._listWhere(user, filters);
    delete where[this.userIdField];

    // force listing with status
    if (!this._isAdmin(user)) {
      where.status = GROUP_STATUS.ACTIVE;
    }

    return where;
  }

  create(user, data) {
    return super.create(user, data).then(group => {
      return permissionService
        .addPermission(user, group, GROUP_PERMISSION.ADMIN, true)
        .then(() => chatService.createGroupChat(user, group))
        .then(chat => {
          group.chat = chat._id;
          return group.save();
        })
        .then(() => group);
    });
  }

  get(user, id) {
    return super.get(user, id).then(group => {
      if (
        group.status !== GROUP_STATUS.ACTIVE &&
        !this._isAdmin(user) &&
        !this._isGroupAdmin(user, group)
      ) {
        throw new APIError('Not found', 404);
      }

      return group;
    });
  }

  getMembers(user, groupid, filters = {}, sorts, skip, limit) {
    return userService.list(
      user,
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

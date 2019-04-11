const BaseCrudService = require('./BaseCrudService');
const userService = require('./user.service');
const APIError = require('../utils/api-error');
const permissionService = require('./permission.service');
const chatService = require('./chat.service');
const notify = require('../utils/notify');
const GROUP_PERMISSION = require('../constants/group-permission');
const GROUP_STATUS = require('../constants/group-status');
const NOTIFICATION_TYPE = require('../constants/notification-type');

// @TODO send notification to admins
class GroupService extends BaseCrudService {
  constructor() {
    super(
      'Group',
      ['name', 'description', 'rules', 'closed'],
      ['status'],
      'createdBy'
    );
  }

  _notifyAdmins(currentUser, type, group) {
    this.getAdmins(currentUser, group._id).then(result => {
      result.data.forEach(admin => {
        return notify.send(admin, type, {
          group: {
            id: group._id.toString(),
            name: group.name
          }
        });
      });
    });
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

  update(user, item, data) {
    const prevStatus = item.status;
    const nextStatus = data.status;
    return super.update(user, item, data).then(group => {
      if (
        nextStatus === GROUP_STATUS.ACTIVE &&
        prevStatus !== GROUP_STATUS.ACTIVE
      ) {
        this._notifyAdmins(user, NOTIFICATION_TYPE.GROUP.ACTIVE, item);
      } else if (
        nextStatus === GROUP_STATUS.INACTIVE &&
        prevStatus !== GROUP_STATUS.INACTIVE
      ) {
        this._notifyAdmins(user, NOTIFICATION_TYPE.GROUP.INACTIVE, item);
      }

      return group;
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

  getAdmins(user, groupid, filters = {}, sorts, skip, limit) {
    return this.getMembers(
      user,
      groupid,
      {
        ...filters,
        groups: {
          $elemMatch: {
            permission: GROUP_PERMISSION.ADMIN,
            group: groupid
          }
        }
      },
      sorts,
      skip,
      limit
    );
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

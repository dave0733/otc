const _ = require('lodash');
const mongoose = require('mongoose');
const APIError = require('../utils/api-error');
const userService = require('./user.service');
const permUtils = require('../utils/permission');
const notify = require('../utils/notify');
const mailer = require('../utils/mailer');
const MAIL_TYPES = require('../constants/mail-type');
const GROUP_PERMISSION = require('../constants/group-permission');
const GROUP_STATUS = require('../constants/group-status');
const NOTIFICATION_TYPE = require('../constants/notification-type');

class PermisisonService {
  constructor() {
    this.userModel = mongoose.model('User');
    this.addPermission = this.addPermission.bind(this);
    this.removePermission = this.removePermission.bind(this);
    this.upsertPermission = this.upsertPermission.bind(this);

    this.applyForGroup = this.applyForGroup.bind(this);
    this.banFromGroup = this.banFromGroup.bind(this);
    this.makeAdminForGroup = this.makeAdminForGroup.bind(this);
    this.makeMemberForGroup = this.makeMemberForGroup.bind(this);

    this.revokeMemberAccess = this.revokeMemberAccess.bind(this);
    this.revokeApplication = this.revokeApplication.bind(this);
    this.revokeAdminAccess = this.revokeAdminAccess.bind(this);
    this.revokeBan = this.revokeBan.bind(this);

    this.removeAllGroupPermissions = this.removeAllGroupPermissions.bind(this);
  }

  _notify(user, group, type) {
    return notify.send(user, type, {
      group: {
        id: group._id.toString(),
        name: group.name
      }
    });
  }

  getAdmins(user, groupid, filters = {}, sorts, skip, limit) {
    return userService.list(
      user,
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

  addPermission(user, group, permission, isForced, body) {
    if (!isForced && group.status !== GROUP_STATUS.ACTIVE) {
      return Promise.reject(new APIError('This group is not active yet', 403));
    }

    if (permUtils.isBanned(user, group)) {
      return Promise.reject(
        new APIError('You are banned from this group', 403)
      );
    }
    const comment = _.get(body, 'comment', '');

    return this.userModel
      .findOneAndUpdate(
        {
          _id: user._id,
          'groups.group': {
            $ne: group._id
          }
        },
        {
          $push: {
            groups: {
              group: group._id,
              permission,
              comment
            }
          }
        }
      )
      .then(() => ({ group, permission }));
  }

  removePermission(user, group, permission) {
    const condition = {
      group: group._id
    };

    if (permission) {
      condition.permission = permission;
    }

    return this.userModel.findOneAndUpdate(
      {
        _id: user._id
      },
      {
        $pull: {
          groups: condition
        }
      }
    );
  }

  removeAllGroupPermissions(group) {
    return this.userModel.updateMany(
      {
        groups: {
          $elemMatch: {
            group: group._id
          }
        }
      },
      {
        $pull: {
          groups: {
            group: group._id
          }
        }
      }
    );
  }

  upsertPermission(user, group, permission, isForced) {
    if (!isForced && group.status !== GROUP_STATUS.ACTIVE) {
      return Promise.reject(new APIError('This group is not active yet', 403));
    }

    return this.removePermission(user, group).then(() =>
      this.addPermission(user, group, permission)
    );
  }

  getPermissions(user) {
    return this.userModel
      .findById(user._id)
      .select('groups')
      .populate('groups.group');
  }

  revokeMemberAccess(user, group) {
    return this.removePermission(user, group, GROUP_PERMISSION.MEMBER).then(
      () => {
        this._notify(user, group, NOTIFICATION_TYPE.PERMISSION.REVOKED_MEMBER);
      }
    );
  }

  revokeApplication(user, group) {
    return this.removePermission(user, group, GROUP_PERMISSION.APPLIED);
  }

  revokeAdminAccess(user, group) {
    return this.removePermission(user, group, GROUP_PERMISSION.ADMIN).then(
      () => {
        this._notify(user, group, NOTIFICATION_TYPE.PERMISSION.REVOKED_ADMIN);
      }
    );
  }

  revokeBan(user, group) {
    return this.removePermission(user, group, GROUP_PERMISSION.BANNED).then(
      () => {
        this._notify(user, group, NOTIFICATION_TYPE.PERMISSION.UNBANNED);
      }
    );
  }

  applyForGroup(user, group, body) {
    if (
      permUtils.isGroupMember(user, group) ||
      permUtils.isGroupAdmin(user, group)
    ) {
      return Promise.reject(
        new APIError('You are already member of the group', 400)
      );
    }

    return this.addPermission(
      user,
      group,
      GROUP_PERMISSION.APPLIED,
      false,
      body
    ).then(() => {
      this.getAdmins(user, group._id).then(result => {
        mailer.send(result.data, MAIL_TYPES.APPLICATION_RECEIVED, {
          group,
          user
        });
        result.data.forEach(admin => {
          return notify.send(
            admin,
            NOTIFICATION_TYPE.PERMISSION.RECEIVED_APPLICATION,
            {
              group: {
                id: group._id.toString(),
                name: group.name
              },
              user: {
                id: user._id.toString(),
                firstName: user.firstName,
                lastName: user.lastName
              }
            }
          );
        });
      });
    });
  }

  banFromGroup(user, group) {
    return this.upsertPermission(user, group, GROUP_PERMISSION.BANNED).then(
      () => {
        this._notify(user, group, NOTIFICATION_TYPE.PERMISSION.BANNED);
      }
    );
  }

  makeAdminForGroup(user, group) {
    return this.upsertPermission(user, group, GROUP_PERMISSION.ADMIN).then(
      () => {
        this._notify(user, group, NOTIFICATION_TYPE.PERMISSION.GRANTED_ADMIN);
      }
    );
  }

  makeMemberForGroup(user, group) {
    return this.upsertPermission(user, group, GROUP_PERMISSION.MEMBER).then(
      () => {
        this._notify(user, group, NOTIFICATION_TYPE.PERMISSION.GRANTED_MEMBER);
        mailer.send(user, MAIL_TYPES.GROUP_JOINED, {
          group
        });
      }
    );
  }
}

module.exports = new PermisisonService();

const mongoose = require('mongoose');
const GROUP_PERMISSION = require('../constants/group-permission');

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
  }

  addPermission(user, group, permission) {
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
              permission
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

  upsertPermission(user, group, permission) {
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
    return this.removePermission(user, group, GROUP_PERMISSION.MEMBER);
  }

  revokeApplication(user, group) {
    return this.removePermission(user, group, GROUP_PERMISSION.APPLIED);
  }

  revokeAdminAccess(user, group) {
    return this.removePermission(user, group, GROUP_PERMISSION.ADMIN);
  }

  revokeBan(user, group) {
    return this.removePermission(user, group, GROUP_PERMISSION.BANNED);
  }

  applyForGroup(user, group) {
    return this.addPermission(user, group, GROUP_PERMISSION.APPLIED);
  }

  banFromGroup(user, group) {
    return this.upsertPermission(user, group, GROUP_PERMISSION.BANNED);
  }

  makeAdminForGroup(user, group) {
    return this.upsertPermission(user, group, GROUP_PERMISSION.ADMIN);
  }

  makeMemberForGroup(user, group) {
    return this.upsertPermission(user, group, GROUP_PERMISSION.MEMBER);
  }
}

module.exports = new PermisisonService();
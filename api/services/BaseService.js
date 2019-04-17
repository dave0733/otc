const APIError = require('../utils/api-error');
const permUtils = require('../utils/permission');

class BaseService {
  constructor() {
    this.checkOwner = this.checkOwner.bind(this);
  }

  _isAdmin(user) {
    return permUtils.isAdmin(user);
  }

  _hasAccess(user, group, permission) {
    return permUtils.hasAccess(user, group, permission);
  }

  _isGroupAdmin(user, group) {
    return permUtils.isGroupAdmin(user, group);
  }

  _isGroupMember(user, group) {
    return permUtils.isGroupMember(user, group);
  }

  _isBanned(user, group) {
    return permUtils.isBanned(user, group);
  }

  _isOwner(user, obj, fieldName) {
    return (
      user &&
      obj &&
      obj[fieldName || this.userIdField] &&
      obj[fieldName || this.userIdField].equals(user.id)
    );
  }

  checkOwner(
    user,
    obj,
    fieldName,
    message = 'You are not authorized to do this action'
  ) {
    return Promise.resolve().then(() => {
      console.log(user, obj, fieldName);
      if (!this._isOwner(user, obj, fieldName) && !this._isAdmin(user)) {
        throw new APIError(message, 403);
      }
    });
  }
}

module.exports = BaseService;

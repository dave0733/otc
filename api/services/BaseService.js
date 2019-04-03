const APIError = require('../utils/api-error');
const permUtils = require('../utils/permission');

class BaseService {
  constructor() {
    this.currentUser = null;

    this.checkOwner = this.checkOwner.bind(this);
    this.setCurrentUser = this.setCurrentUser.bind(this);
  }

  _isAdmin() {
    return permUtils.isAdmin(this.currentUser);
  }

  _hasAccess(group, permission) {
    return permUtils.hasAccess(this.currentUser, group, permission);
  }

  _isGroupAdmin(group) {
    return permUtils.isGroupAdmin(this.currentUser, group);
  }

  _isGroupMember(group) {
    return permUtils.isGroupMember(this.currentUser, group);
  }

  _isBanned(group) {
    return permUtils.isBanned(this.currentUser, group);
  }

  _isOwner(obj, fieldName) {
    return (
      this.currentUser &&
      obj &&
      obj[fieldName || this.userIdField] &&
      obj[fieldName || this.userIdField].equals(this.currentUser.id)
    );
  }

  checkOwner(
    obj,
    fieldName,
    message = 'You are not authorized to do this action'
  ) {
    return Promise.resolve().then(() => {
      if (!this._isOwner(obj, fieldName) && !this._isAdmin()) {
        throw new APIError(message, 403);
      }
    });
  }

  setCurrentUser(currentUser) {
    this.currentUser = currentUser;
  }
}

module.exports = BaseService;

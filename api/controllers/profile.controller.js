const mongoose = require('mongoose');
const APIError = require('../utils/api-error');
const userService = require('../services/user.service');
const permissionService = require('../services/permission.service');

const User = mongoose.model('User');

class ProfileController {
  getProfile(req, res) {
    res.send(req.user);
  }

  updateProfile(req, res, next) {
    userService
      .update(req.user, req.body)
      .then(user => res.json(user))
      .catch(next);
  }

  changePassword(req, res, next) {
    User.findById(req.user.id)
      .then(user => {
        if (!user) {
          throw new APIError('User not found', 404);
        }

        return userService.changePassword(user, req.body);
      })
      .then(() => res.json({ success: true }))
      .catch(next);
  }

  getPermissions(req, res, next) {
    return permissionService
      .getPermissions(req.user)
      .then(groups => res.json(groups))
      .catch(next);
  }

  applyForGroup(req, res, next) {
    return permissionService
      .applyForGroup(req.user, req.group)
      .then(() => res.json({ success: true }))
      .catch(next);
  }

  revokeApplication(req, res, next) {
    return permissionService
      .revokeApplication(req.user, req.group)
      .then(() => res.json({ success: true }))
      .catch(next);
  }

  revokeMemberAccess(req, res, next) {
    return permissionService
      .revokeMemberAccess(req.user, req.group)
      .then(() => res.json({ success: true }))
      .catch(next);
  }
}

module.exports = new ProfileController();

const permissionService = require('../services/permission.service');

class PermissionController {
  getPermissions(req, res, next) {
    return permissionService
      .getPermissions(req.queryUser)
      .then(groups => res.json(groups))
      .catch(next);
  }

  makeMemberForGroup(req, res, next) {
    return permissionService
      .makeMemberForGroup(req.queryUser, req.group)
      .then(() => res.json({ success: true }))
      .catch(next);
  }

  makeAdminForGroup(req, res, next) {
    return permissionService
      .makeAdminForGroup(req.queryUser, req.group)
      .then(() => res.json({ success: true }))
      .catch(next);
  }

  banFromGroup(req, res, next) {
    return permissionService
      .banFromGroup(req.queryUser, req.group)
      .then(() => res.json({ success: true }))
      .catch(next);
  }

  revokeMemberAccess(req, res, next) {
    return permissionService
      .revokeMemberAccess(req.queryUser, req.group)
      .then(() => res.json({ success: true }))
      .catch(next);
  }

  revokeApplication(req, res, next) {
    return permissionService
      .revokeApplication(req.queryUser, req.group)
      .then(() => res.json({ success: true }))
      .catch(next);
  }

  revokeAdminAccess(req, res, next) {
    return permissionService
      .revokeAdminAccess(req.queryUser, req.group)
      .then(() => res.json({ success: true }))
      .catch(next);
  }

  revokeBan(req, res, next) {
    return permissionService
      .revokeBan(req.queryUser, req.group)
      .then(() => res.json({ success: true }))
      .catch(next);
  }
}

module.exports = new PermissionController();

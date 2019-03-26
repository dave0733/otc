const express = require('express');
const permissionCtrl = require('../controllers/permission.controller');
const groupCtrl = require('../controllers/group.controller');
const { isGroupAdmin, isAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.route('/').get(isAdmin, permissionCtrl.getPermissions);

router
  .route('/:groupid/apply')
  .delete(isGroupAdmin, permissionCtrl.revokeApplication);

router
  .route('/:groupid/member')
  .put(isGroupAdmin, permissionCtrl.makeMemberForGroup)
  .delete(isGroupAdmin, permissionCtrl.revokeMemberAccess);

router
  .route('/:groupid/admin')
  .put(isAdmin, permissionCtrl.makeAdminForGroup)
  .delete(isAdmin, permissionCtrl.revokeAdminAccess);

router
  .route('/:groupid/ban')
  .put(isGroupAdmin, permissionCtrl.banFromGroup)
  .delete(isGroupAdmin, permissionCtrl.revokeBan);

router.param('groupid', groupCtrl.getByIdMiddleware);
module.exports = router;

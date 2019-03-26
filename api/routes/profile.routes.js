const express = require('express');
const profileCtrl = require('../controllers/profile.controller');
const groupCtrl = require('../controllers/group.controller');

const router = express.Router();

router
  .route('/')
  .get(profileCtrl.getProfile)
  .put(profileCtrl.updateProfile);

router.route('/change-password').post(profileCtrl.changePassword);

router.route('/permissions').get(profileCtrl.getPermissions);
router
  .route('/permissions/:groupid/apply')
  .put(profileCtrl.applyForGroup)
  .delete(profileCtrl.revokeApplication);

router
  .route('/permissions/:groupid/member')
  .delete(profileCtrl.revokeMemberAccess);

router.param('groupid', groupCtrl.getByIdMiddleware);
module.exports = router;

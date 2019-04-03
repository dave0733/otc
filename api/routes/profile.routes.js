const express = require('express');
const authCtrl = require('../controllers/auth.controller');
const profileCtrl = require('../controllers/profile.controller');
const groupCtrl = require('../controllers/group.controller');
const offerCtrl = require('../controllers/offer.controller');
const proposalCtrl = require('../controllers/proposal.controller');
const vouchCtrl = require('../controllers/vouch.controller');

const router = express.Router();

router
  .route('/')
  .get(profileCtrl.getProfile)
  .put(profileCtrl.updateProfile);

router.route('/change-password').post(profileCtrl.changePassword);
router.route('/refresh-firebase-token').get(authCtrl.refreshFirebaseToken);

router.route('/permissions').get(profileCtrl.getPermissions);
router.route('/my-groups/:groupid/offers').get(offerCtrl.list);
router.route('/my-groups/:groupid/proposals').get(proposalCtrl.list);
router.route('/my-groups/:groupid/vouches').get(vouchCtrl.list);

router
  .route('/permissions/:groupid/apply')
  .put(profileCtrl.applyForGroup)
  .delete(profileCtrl.revokeApplication);

router
  .route('/permissions/:groupid/member')
  .delete(profileCtrl.revokeMemberAccess);

router.param('groupid', groupCtrl.getByIdMiddleware);
module.exports = router;

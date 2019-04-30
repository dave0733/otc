const express = require('express');
const multer = require('multer');
const authCtrl = require('../controllers/auth.controller');
const profileCtrl = require('../controllers/profile.controller');
const groupCtrl = require('../controllers/group.controller');
const offerCtrl = require('../controllers/offer.controller');
const proposalCtrl = require('../controllers/proposal.controller');
const vouchCtrl = require('../controllers/vouch.controller');
const chatCtrl = require('../controllers/chat.controller');
const { is2FA } = require('../middlewares/auth.middleware');
const config = require('../../config');

const router = express.Router();
const uploader = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.firebaseUploadLimit
  }
});

router
  .route('/')
  .get(profileCtrl.getProfile)
  .put(profileCtrl.updateProfile);

router.route('/change-password').post(profileCtrl.changePassword);
router.route('/refresh-firebase-token').get(authCtrl.refreshFirebaseToken);
router.route('/avatar').post(uploader.single('file'), profileCtrl.uploadAvatar);

router.route('/permissions').get(profileCtrl.getPermissions);
router.route('/offers').get(offerCtrl.listMyOffers);
router.route('/my-groups/:groupid/proposals').get(proposalCtrl.list);
router.route('/my-groups/:groupid/vouches').get(vouchCtrl.listRequestedVouches);
router.route('/chats').get(chatCtrl.getAllPrivateChats);

router
  .route('/permissions/:groupid/apply')
  .put(profileCtrl.applyForGroup)
  .delete(profileCtrl.revokeApplication);

router
  .route('/permissions/:groupid/member')
  .delete(profileCtrl.revokeMemberAccess);

router.route('/2fa').put(is2FA(false), profileCtrl.update2FA);

router.param('groupid', groupCtrl.getByIdMiddleware);
module.exports = router;

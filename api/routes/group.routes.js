const express = require('express');
const groupCtrl = require('../controllers/group.controller');
const {
  isGroupAdmin,
  hasGroupAccess
} = require('../middlewares/auth.middleware');
const offerRoutes = require('./offer.routes');

const router = express.Router();

router
  .route('/')
  .post(groupCtrl.create)
  .get(groupCtrl.list);

router
  .route('/:groupid')
  .get(groupCtrl.read)
  .put(isGroupAdmin, groupCtrl.update)
  .delete(isGroupAdmin, groupCtrl.remove);

router.route('/:groupid/members').get(hasGroupAccess, groupCtrl.getMembers);
router.use('/:groupid/offers', hasGroupAccess, offerRoutes);

router.param('groupid', groupCtrl.getByIdMiddleware);

module.exports = router;

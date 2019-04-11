const express = require('express');
const userCtrl = require('../controllers/user.controller');
const offerCtrl = require('../controllers/offer.controller');
const { isAdmin } = require('../middlewares/auth.middleware');

const permissionRoutes = require('./permission.routes');

const router = express.Router();

router
  .route('/')
  .post(isAdmin, userCtrl.create)
  .get(userCtrl.list);

router
  .route('/:id')
  .get(userCtrl.read)
  .put(isAdmin, userCtrl.update)
  .delete(isAdmin, userCtrl.remove);

router.use('/:id/permissions', permissionRoutes);
router.route('/:id/feedback').get(offerCtrl.listFeedback);

router.param('id', userCtrl.getByIdMiddleware);

module.exports = router;

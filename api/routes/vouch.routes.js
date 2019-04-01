const express = require('express');
const vouchCtrl = require('../controllers/vouch.controller');
const offerCtrl = require('../controllers/offer.controller');

const router = express.Router();

router
  .route('/')
  .post(vouchCtrl.create)
  .get(offerCtrl.getVouches);

router.route('/:vouchid').delete(vouchCtrl.remove);

router.route('/:vouchid/accept').put(vouchCtrl.acceptVouch);
router.route('/:vouchid/reject').put(vouchCtrl.rejectVouch);

router.param('vouchid', vouchCtrl.getByIdMiddleware);

module.exports = router;

const express = require('express');
const offerCtrl = require('../controllers/offer.controller');
const proposalRoutes = require('./proposal.routes');
const { is2FA } = require('../middlewares/auth.middleware');

const router = express.Router();

router
  .route('/')
  .post(is2FA(), offerCtrl.create)
  .get(offerCtrl.list);

router
  .route('/:offerid')
  .get(offerCtrl.read)
  .put(is2FA(), offerCtrl.update)
  .delete(offerCtrl.remove);

router.route('/:offerid/end').put(is2FA(), offerCtrl.endListing);
router
  .route('/:offerid/leave-feedback-to-proposal')
  .put(offerCtrl.leaveFeedbackToProposal);
router
  .route('/:offerid/leave-feedback-to-offer')
  .put(offerCtrl.leaveFeedbackToOffer);

router.route('/:offerid/vouches').get(offerCtrl.getVouches);

router.use('/:offerid/proposals', proposalRoutes);

router.param('offerid', offerCtrl.getByIdMiddleware);

module.exports = router;

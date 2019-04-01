const express = require('express');
const offerCtrl = require('../controllers/offer.controller');
const proposalRoutes = require('./proposal.routes');
const vouchRoutes = require('./vouch.routes');

const router = express.Router();

router
  .route('/')
  .post(offerCtrl.create)
  .get(offerCtrl.list);

router
  .route('/:offerid')
  .get(offerCtrl.read)
  .put(offerCtrl.update)
  .delete(offerCtrl.remove);

router.route('/:offerid/end').put(offerCtrl.endListing);
router
  .route('/:offerid/leave-feedback-to-proposal')
  .put(offerCtrl.leaveFeedbackToProposal);
router
  .route('/:offerid/leave-feedback-to-offer')
  .put(offerCtrl.leaveFeedbackToOffer);

router.use('/:offerid/proposals', proposalRoutes);
router.use('/:offerid/vouches', vouchRoutes);

router.param('offerid', offerCtrl.getByIdMiddleware);

module.exports = router;

const express = require('express');
const proposalCtrl = require('../controllers/proposal.controller');
const offerCtrl = require('../controllers/offer.controller');

const router = express.Router();

router
  .route('/')
  .post(proposalCtrl.create)
  .get(offerCtrl.getProposals);

router
  .route('/:proposalid')
  .put(proposalCtrl.update)
  .delete(proposalCtrl.remove);

router.route('/:proposalid/accept').put(offerCtrl.acceptProposal);
router.route('/:proposalid/reject').put(offerCtrl.rejectProposal);

router.param('proposalid', proposalCtrl.getByIdMiddleware);

module.exports = router;

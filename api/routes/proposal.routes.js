const express = require('express');
const proposalCtrl = require('../controllers/proposal.controller');
const offerCtrl = require('../controllers/offer.controller');
const { is2FA } = require('../middlewares/auth.middleware');

const router = express.Router();

router
  .route('/')
  .post(is2FA(), proposalCtrl.create)
  .get(offerCtrl.getProposals);

router
  .route('/:proposalid')
  .put(proposalCtrl.update)
  .delete(proposalCtrl.remove);

router.route('/:proposalid/accept').put(is2FA(), offerCtrl.acceptProposal);
router.route('/:proposalid/reject').put(is2FA(), offerCtrl.rejectProposal);

router.param('proposalid', proposalCtrl.getByIdMiddleware);

module.exports = router;

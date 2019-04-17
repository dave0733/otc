const express = require('express');
const vouchCtrl = require('../controllers/vouch.controller');
const { is2FA } = require('../middlewares/auth.middleware');

const router = express.Router();

router
  .route('/')
  .post(vouchCtrl.create)
  .get(vouchCtrl.list);

router.route('/:vouchid').delete(vouchCtrl.remove);

router.route('/:vouchid/accept').put(is2FA(), vouchCtrl.acceptVouch);
router.route('/:vouchid/reject').put(is2FA(), vouchCtrl.rejectVouch);

router.param('vouchid', vouchCtrl.getByIdMiddleware);

module.exports = router;

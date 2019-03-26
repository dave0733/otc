const express = require('express');
const groupCtrl = require('../controllers/group.controller');
const { isGroupAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router
  .route('/')
  .post(groupCtrl.create)
  .get(groupCtrl.list);

router
  .route('/:id')
  .get(groupCtrl.read)
  .put(isGroupAdmin, groupCtrl.update)
  .delete(isGroupAdmin, groupCtrl.remove);

router.route('/:id/members').get(isGroupAdmin, groupCtrl.getMembers);

router.param('id', groupCtrl.getByIdMiddleware);

module.exports = router;

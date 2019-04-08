const express = require('express');
const chatCtrl = require('../controllers/chat.controller');
const msgRoutes = require('./messages.routes');

const router = express.Router();

router
  .route('/')
  .post(chatCtrl.createPrivateChat)
  .get(chatCtrl.getPrivateChats);

router.use('/:chatid/messages', msgRoutes);

router.param('chatid', chatCtrl.getByIdMiddleware);

module.exports = router;

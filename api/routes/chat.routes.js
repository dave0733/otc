const express = require('express');
const chatCtrl = require('../controllers/chat.controller');

const router = express.Router();

router
  .route('/')
  .post(chatCtrl.createPrivateChat)
  .get(chatCtrl.getPrivateChats);

router.route('/:chatid/messages').post(chatCtrl.sendMessage);

router.param('chatid', chatCtrl.getByIdMiddleware);

module.exports = router;

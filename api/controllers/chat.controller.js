const BaseCrudController = require('./BaseCrudController');
const chatService = require('../services/chat.service');

class ChatController extends BaseCrudController {
  constructor() {
    super(chatService, 'chat');

    this.getPrivateChats = this.getPrivateChats.bind(this);
    this.createPrivateChat = this.createPrivateChat.bind(this);
  }

  getPrivateChats(req, res, next) {
    chatService.setCurrentUser(req.user);
    chatService
      .getPrivateChats(req.group)
      .then(chats => {
        res.json(chats);
      })
      .catch(next);
  }

  createPrivateChat(req, res, next) {
    chatService.setCurrentUser(req.user);
    chatService
      .createPrivateChat(req.group, req.body)
      .then(chat => {
        res.json(chat);
      })
      .catch(next);
  }
}

module.exports = new ChatController();

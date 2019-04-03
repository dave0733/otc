const firebase = require('../utils/firebase');
const BaseService = require('./BaseService');
const CHAT_TYPES = require('../constants/chat-type');
const MESSAGE_TYPES = require('../constants/message-type');
const APIError = require('../utils/api-error');

class MessageService extends BaseService {
  constructor() {
    super();
    this.create = this.create.bind(this);
  }

  create(chat, data) {
    const users = chat.users.map(u => u.toString());
    if (
      chat.type !== CHAT_TYPES.GROUP &&
      !users.includes(this.currentUser._id.toString())
    ) {
      return Promise.reject(
        new APIError('You are not authorized to send message here', 403)
      );
    }

    const fs = firebase.getFirestore();
    const message = fs
      .collection('chats')
      .doc(chat._id.toString())
      .collection('messages')
      .doc();

    const msgData = {
      type: MESSAGE_TYPES.TEXT,
      sender_id: this.currentUser._id.toString(),
      text: data.text,
      created_at: new Date().valueOf(),
      updated_at: new Date().valueOf()
    };

    return message.set(msgData).then(() => ({
      ...data,
      id: message.id
    }));
  }
}

module.exports = new MessageService();

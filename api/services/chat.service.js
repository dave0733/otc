const mongoose = require('mongoose');
const firebase = require('../utils/firebase');
const BaseCrudService = require('./BaseCrudService');
const userService = require('./user.service');
const CHAT_TYPES = require('../constants/chat-type');
const APIError = require('../utils/api-error');
const permUtils = require('../utils/permission');

const ChatModel = mongoose.model('Chat');

class ChatService extends BaseCrudService {
  constructor() {
    super('Chat');
    this.createPrivateChat = this.createPrivateChat.bind(this);
    this.createGroupChat = this.createGroupChat.bind(this);
    this.getPrivateChats = this.getPrivateChats.bind(this);
  }

  _createPrivateChatOnFirebase(id, group, data) {
    const fs = firebase.getFirestore();
    const chat = fs.collection('chats').doc(id);

    return chat.set({
      group_id: group._id.toString(),
      user_ids: [this.currentUser._id.toString(), data.userId],
      type: 'private',
      created_at: new Date().valueOf(),
      updated_at: new Date().valueOf()
    });
  }

  _createGroupChatOnFirebase(group) {
    const fs = firebase.getFirestore();
    const groupId = group._id.toString();
    const chat = fs.collection('chats').doc(groupId);
    const data = {
      group_id: groupId,
      type: 'group',
      created_at: new Date().valueOf(),
      updated_at: new Date().valueOf()
    };

    return chat.set(data).then(() => ({
      ...data,
      id: chat.id
    }));
  }

  createPrivateChat(group, data) {
    return userService.get(data.userId).then(otherUser => {
      if (otherUser._id.equals(this.currentUser._id)) {
        throw new APIError('You can not create chat with yourself', 400);
      }

      if (
        !permUtils.isGroupAdmin(otherUser, group) &&
        !permUtils.isGroupMember(otherUser, group)
      ) {
        throw new APIError(
          'The user you are trying to chat is not member of the group.',
          400
        );
      }

      return ChatModel.findOne({
        users: { $all: [this.currentUser._id, otherUser._id] },
        group: group._id,
        type: CHAT_TYPES.PRIVATE
      }).then(existingChat => {
        if (existingChat) {
          return existingChat;
        }

        const chat = new ChatModel({
          group: group._id,
          createdBy: this.currentUser._id,
          users: [this.currentUser._id, data.userId]
        });

        return chat
          .save()
          .then(() =>
            this._createPrivateChatOnFirebase(chat._id.toString(), group, data)
          )
          .then(() => chat);
      });
    });
  }

  createGroupChat(group) {
    const chat = new ChatModel({
      type: CHAT_TYPES.GROUP,
      group: group._id
    });

    return chat
      .save()
      .then(() => this._createGroupChatOnFirebase(group))
      .then(() => chat);
  }

  getPrivateChats(group) {
    return ChatModel.find({
      users: this.currentUser._id,
      group: group._id,
      type: CHAT_TYPES.PRIVATE
    });
  }
}

module.exports = new ChatService();

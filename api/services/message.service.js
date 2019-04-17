const _ = require('lodash');
const BaseService = require('./BaseService');
const generateToken = require('../utils/token');
const firebase = require('../utils/firebase');
const CHAT_TYPES = require('../constants/chat-type');
const MESSAGE_TYPES = require('../constants/message-type');
const APIError = require('../utils/api-error');

class MessageService extends BaseService {
  constructor() {
    super();
    this.create = this.create.bind(this);
    this.createFileMessage = this.createFileMessage.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.get = this.get.bind(this);
    this._createSystemMessage = this._createSystemMessage.bind(this);
    this._uploadImageToStorage = this._uploadImageToStorage.bind(this);
  }

  _uploadImageToStorage(chat, file, originalName) {
    const bucket = firebase.getBucket();
    const id = generateToken(20);
    const filename = `chats/${chat._id.toString()}/${id}`;

    const prom = new Promise((resolve, reject) => {
      if (!file) {
        reject(new APIError('No file', 400));
      }
      const fileUpload = bucket.file(filename);
      const metadata = {
        cacheControl: 'public, max-age=31536000', // file won't change once uploaded
        contentType: file.mimetype,
        metadata: {
          user_ids: (chat.users || []).map(u => u.toString()).join('_')
        }
      };

      const blobStream = fileUpload.createWriteStream({
        gzip: true,
        metadata
      });

      blobStream.on('error', error => {
        reject(error);
      });

      blobStream.on('finish', () => {
        resolve({
          uuid: fileUpload.name,
          name: originalName || null
        });
      });

      blobStream.end(file.buffer);
    });

    return prom;
  }

  _createSystemMessage(chatID, type, extra) {
    const fs = firebase.getFirestore();
    const message = fs
      .collection('chats')
      .doc(chatID.toString())
      .collection('alerts')
      .doc();

    const msgData = {
      type,
      extra: extra || null,
      created_at: new Date().valueOf(),
      updated_at: new Date().valueOf()
    };

    return message.set(msgData).then(() => ({
      ...msgData,
      id: message.id
    }));
  }

  createFileMessage(user, chat, data, file) {
    return this._uploadImageToStorage(chat, file, data.filename).then(
      fileInfo => {
        return this.create(user, chat, data, {
          file: fileInfo
        });
      }
    );
  }

  create(user, chat, data, extra) {
    const users = chat.users.map(u => u.toString());
    if (
      chat.type !== CHAT_TYPES.GROUP &&
      !users.includes(user._id.toString())
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
      sender_id: user._id.toString(),
      text: data.text || null,
      extra: extra || null,
      created_at: new Date().valueOf(),
      updated_at: new Date().valueOf()
    };

    return message.set(msgData).then(() => ({
      ...data,
      extra,
      id: message.id
    }));
  }

  update(user, message, data) {
    const updateData = _.pick(data, ['text']);
    updateData.updated_at = new Date().valueOf();
    return message._ref.update(updateData);
  }

  delete(user, message) {
    return message._ref.delete();
  }

  get(user, chat, id) {
    const fs = firebase.getFirestore();
    const message = fs
      .collection('chats')
      .doc(chat._id.toString())
      .collection('messages')
      .doc(id);

    return message.get().then(doc => {
      if (!doc.exists) {
        throw new APIError('Message not found', 404);
      }

      const data = doc.data();
      if (!this._isAdmin(user) && data.sender_id !== user._id.toString()) {
        throw new APIError('You are forbidden to this action', 403);
      }

      return doc;
    });
  }
}

module.exports = new MessageService();

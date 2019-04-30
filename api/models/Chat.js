const mongoose = require('mongoose');
const CHAT_TYPES = require('../constants/chat-type');

const { Schema } = mongoose;

const chatSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      default: CHAT_TYPES.PRIVATE,
      enum: Object.values(CHAT_TYPES)
    },
    messageCount: { type: Number, default: 0 },
    group: { type: Schema.ObjectId, ref: 'Group' },
    createdBy: { type: Schema.ObjectId, ref: 'User' },
    users: [{ type: Schema.ObjectId, ref: 'User' }]
  },
  {
    collection: 'chats',
    timestamps: true
  }
);

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;

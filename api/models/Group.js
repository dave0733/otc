const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const STATUSES = require('../constants/group-status');

const { Schema } = mongoose;

const groupSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    rules: { type: String },
    closed: { type: Boolean, default: false },
    status: {
      type: String,
      required: true,
      default: STATUSES.PENDING,
      enum: Object.values(STATUSES)
    },
    createdBy: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    chat: {
      type: Schema.ObjectId,
      ref: 'Chat'
    }
  },
  {
    collection: 'groups',
    timestamps: true
  }
);
groupSchema.plugin(mongooseDelete, { overrideMethods: true });

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;

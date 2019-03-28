const mongoose = require('mongoose');
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
    }
  },
  {
    collection: 'groups',
    timestamps: true
  }
);

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;

const mongoose = require('mongoose');
const VOUCH_STATUS = require('../constants/vouch-status');

const { Schema } = mongoose;

const vouchSchema = new Schema(
  {
    status: {
      type: String,
      required: true,
      enum: Object.values(VOUCH_STATUS),
      default: VOUCH_STATUS.PENDING
    },
    note: { type: String },
    offer: { type: Schema.ObjectId, ref: 'Offer' },
    proposal: { type: Schema.ObjectId, ref: 'Proposal' },
    group: { type: Schema.ObjectId, ref: 'Group', required: true },
    requestedBy: { type: Schema.ObjectId, ref: 'User', required: true },
    requestedTo: { type: Schema.ObjectId, ref: 'User', required: true }
  },
  {
    collection: 'vouches',
    timestamps: true
  }
);

vouchSchema.index(
  { offer: 1, proposal: 1, requestedBy: 1, requestedTo: 1 },
  { unique: true }
);

const Vouch = mongoose.model('Vouch', vouchSchema);

module.exports = Vouch;

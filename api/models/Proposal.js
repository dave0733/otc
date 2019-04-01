const mongoose = require('mongoose');
const PROPOSAL_STATUS = require('../constants/proposal-status');

const { Schema } = mongoose;

const proposalSchema = new Schema(
  {
    have: { type: String, required: true, maxlength: 32 },
    want: { type: String, required: true, maxlength: 32 },
    status: {
      type: String,
      required: true,
      enum: Object.values(PROPOSAL_STATUS),
      default: PROPOSAL_STATUS.PENDING
    },
    note: { type: String },
    offer: { type: Schema.ObjectId, ref: 'Offer', required: true },
    proposedBy: { type: Schema.ObjectId, ref: 'User', required: true }
  },
  {
    collection: 'proposals',
    timestamps: true
  }
);

proposalSchema.index({ offer: 1, proposedBy: 1 }, { unique: true });

const Proposal = mongoose.model('Proposal', proposalSchema);

module.exports = Proposal;

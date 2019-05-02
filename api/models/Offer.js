const mongoose = require('mongoose');
const OFFER_STATUS = require('../constants/offer-status');

const { Schema } = mongoose;

const feedbackSchema = new Schema(
  {
    timeline: { type: Number, required: true, default: 0, min: 0, max: 5 },
    communication: { type: Number, required: true, default: 0, min: 0, max: 5 },
    comment: { type: String }
  },
  {
    _id: false
  }
);

const offerSchema = new Schema(
  {
    have: { type: String, required: true, maxlength: 45 },
    want: { type: String, required: true, maxlength: 45 },
    note: { type: String },
    status: {
      type: String,
      required: true,
      enum: Object.values(OFFER_STATUS),
      default: OFFER_STATUS.PENDING
    },
    acceptedProposal: { type: Schema.ObjectId, ref: 'Proposal' },
    acceptedVouches: [{ type: Schema.ObjectId, ref: 'Vouch' }],
    proposals: [{ type: Schema.ObjectId, ref: 'Proposal' }],
    offeredBy: { type: Schema.ObjectId, ref: 'User', required: true },
    counterpart: { type: Schema.ObjectId, ref: 'User' },
    group: { type: Schema.ObjectId, ref: 'Group', required: true },
    expiresAt: { type: Date, default: +new Date() + 30 * 24 * 60 * 60 * 1000 }, // 30 days from now

    feedbackToOffer: { type: feedbackSchema }, // offered -> proposal
    feedbackToProposal: { type: feedbackSchema } // proposed -> offer
  },
  {
    collection: 'offers',
    timestamps: true
  }
);

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;

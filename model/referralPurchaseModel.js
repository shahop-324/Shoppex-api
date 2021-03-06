const mongoose = require('mongoose')

const referralPurchaseSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
  },
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Customer',
  },
  order: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
  },
  ref: {
    type: mongoose.Schema.ObjectId,
    ref: "Referral"
  },
  timestamp: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    // Boolean which keeps track of payment made to referrer
    type: Boolean,
    default: false,
  },
  commissionPercent: {
    type: Number,
  },
  commissionAmount: {
    type: Number,
  },
})

const ReferralPurchase = new mongoose.model(
  'ReferralPurchase',
  referralPurchaseSchema,
)

module.exports = ReferralPurchase

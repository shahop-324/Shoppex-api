const mongoose = require('mongoose')

const payoutSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
  },
  amount: {
    type: Number,
  },
  currency: {
    type: String,
    enum: ['INR'],
    default: 'INR',
  },
  method: {
    type: String,
  },
  payoutId: { type: String },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
})

const Payout = new mongoose.model('Payout', payoutSchema)
module.exports = Payout

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
  createdBy: { // unselect
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
  },
  createdAt: { // unselect
    type: Date,
    default: Date.now(),
  },
})

payoutSchema.pre(/^find/, function (next) {
  this.find({}).populate('createdBy');
  next()
})

const Payout = new mongoose.model('Payout', payoutSchema)
module.exports = Payout

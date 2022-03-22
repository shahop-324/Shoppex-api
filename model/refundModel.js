const mongoose = require('mongoose')

const refundSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
  },
  order: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
  },
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Customer',
  },
  amount: {
    type: Number,
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  createdAt: { // unselect
    type: Date,
    default: Date.now(),
  },
})

const Refund = new mongoose.model('Refund', refundSchema)
module.exports = Refund

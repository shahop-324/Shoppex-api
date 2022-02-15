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
  createdAt: {
    type: Date,
    default: Date.now(),
  },
})

const Refund = new mongoose.model('Refund', refundSchema)
module.exports = Refund

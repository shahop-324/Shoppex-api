const mongoose = require('mongoose')

const payoutSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
})

const Payout = new mongoose.model('Payout', payoutSchema)
module.exports = Payout

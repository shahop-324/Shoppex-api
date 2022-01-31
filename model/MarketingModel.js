const mongoose = require('mongoose')

const marketingSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
  },
  name: {
    type: String,
  },
  channel: {
    type: String,
    enum: ['sms', 'mail'],
  },
  amount: {
    type: Number,
  },
  customers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Customer',
    },
  ],
  message: {type: String,},
  html: {type: String,},
  design: {type: String,},
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date },
})

const Marketing = new mongoose.model('Marketing', marketingSchema)

module.exports = Marketing

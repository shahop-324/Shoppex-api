const mongoose = require('mongoose')

const marketingSchema = new mongoose.Schema({
  campaignId: {
    type: String,
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
  },
  name: {
    type: String,
  },
  channel: {
    type: String,
    enum: ['sms', 'email'],
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
  message: { type: String },
  html: { type: String },
  design: { type: Map },
  createdAt: { type: Date, default: Date.now() }, // unselect
  updatedAt: { type: Date }, // unselect
  status: { type: String, enum: ['Draft', 'Sent'], default: 'Draft' },
})

const Marketing = new mongoose.model('Marketing', marketingSchema)

module.exports = Marketing

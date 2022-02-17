const mongoose = require('mongoose')

const earnings = new mongoose.Schema({
  status: { type: String, enum: ['Not Paid', 'Paid'], default: 'Not Paid' },
  amount: { type: Number },
  orderAmount: { type: Number },
  order: { type: mongoose.Schema.ObjectId, ref: 'Order' },
  orderRef: {type: String,},
  timestamp: { type: Date, default: Date.now() },
})

const referralSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
  },
  name: {
    type: String,
  },
  phone: { type: String },
  email: { type: String },
  commission: { type: Number },
  totalSales: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  earnings: [{ earnings }],
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date },
})

referralSchema.index({
  name: 'text',
  phone: 'text',
  email: 'text',
})

const Referral = new mongoose.model('Referral', referralSchema)

module.exports = Referral

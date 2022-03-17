const mongoose = require('mongoose')

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
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date },
});

referralSchema.index({
  name: 'text',
  phone: 'text',
  email: 'text',
});

const Referral = new mongoose.model('Referral', referralSchema);
module.exports = Referral;

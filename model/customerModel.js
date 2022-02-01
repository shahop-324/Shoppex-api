const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema({
  coins: { type: Number, default: 0 },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
  },
  name: {type: String,},
  image: {type: String,},
  phone: { type: String },
  email: { type: String },
  pincode: {type: String,},
  city: {type: String,},
  totalSale: {type: Number,},
  orders: [{ type: mongoose.Schema.ObjectId, ref: 'Order' }],
  addresses: [{ type: mongoose.Schema.ObjectId, ref: 'CustomerAddress' }],
  reviews: [{ type: mongoose.Schema.ObjectId, ref: 'Review' }],
  questions: [{ type: mongoose.Schema.ObjectId, ref: 'Question' }],
  smsCommunications: [
    { type: mongoose.Schema.ObjectId, ref: 'SMSCommunications' },
  ],
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date },
  type: { type: String, enum: ['Self', 'Imported'], default: "Self" },
  tag: { type: String, enum: ['new', 'returning', 'noSale'], default: "new" },
  password: {
    type: String,
  },
  passwordChangedAt: {
    type: Date,
  },
  authOTP: {
    type: String,
  },
});

customerSchema.index({
  name: 'text',
  phone: 'text',
  email: 'text',
  city: 'text',
  pincode: 'text',
})

const Customer = mongoose.model('Customer', customerSchema)
module.exports = Customer
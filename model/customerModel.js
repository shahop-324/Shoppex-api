const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const customerSchema = new mongoose.Schema({
  coins: { type: Number, default: 0 },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
  },
  name: { type: String },
  image: { type: String },
  phone: { type: String },
  email: { type: String },
  pincode: { type: String },
  city: { type: String },
  totalSale: { type: Number },
  orders: [{ type: mongoose.Schema.ObjectId, ref: 'Order' }],
  addresses: [{ type: mongoose.Schema.ObjectId, ref: 'CustomerAddress' }],
  reviews: [{ type: mongoose.Schema.ObjectId, ref: 'Review' }],
  wishlist: [{ type: mongoose.Schema.ObjectId, ref: 'Product' }],
  questions: [{ type: mongoose.Schema.ObjectId, ref: 'Question' }],
  smsCommunications: [
    { type: mongoose.Schema.ObjectId, ref: 'SMSCommunications' },
  ],
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date },
  type: { type: String, enum: ['Self', 'Imported'], default: 'Self' },
  tag: { type: String, enum: ['new', 'returning', 'noSale'], default: 'new' },
  password: {
    type: String,
  },
  passwordChangedAt: {
    type: Date,
  },
  otp: {
    type: String,
  },
  birthDate: {
    type: Date,
  },
  cart: [
    {
      product: { type: mongoose.Schema.ObjectId, ref: 'Product' },
      quantity: { type: Number },
      variants: [
        {
          index: { type: String },
          quantity: { type: Number },
          selectedOption: { type: String },
        },
      ], // {type: String or index of variant available types, value: index of variant},
      color: { type: String },
      pricePerUnit: { type: Number },
      availableQuantity: { type: Number },
    },
  ],
  cartUpdatedAt: {
    type: Date,
  },
  boughtProducts: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
    },
  ],
})

customerSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword)
}

customerSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    )
    return JWTTimeStamp < changedTimeStamp
  }

  // FALSE MEANS NOT CHANGED
  return false
}

customerSchema.index({
  name: 'text',
  phone: 'text',
  email: 'text',
  city: 'text',
  pincode: 'text',
})

const Customer = mongoose.model('Customer', customerSchema)
module.exports = Customer

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
  createdAt: { type: Date, default: Date.now() }, // unselect
  updatedAt: { type: Date }, // unselect
  type: { type: String, enum: ['Self', 'Imported'], default: 'Self' },
  tag: { type: String, enum: ['new', 'returning', 'noSale'], default: 'new' },
  password: { // unselect
    type: String,
  },
  passwordConfirm: { // unselect
    type: String,
  },
  passwordChangedAt: { // unselect
    type: Date,
  },
  otp: { // unselect
    type: String,
  },
  birthDate: { // unselect
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
  cartUpdatedAt: { // unselect
    type: Date,
  },
  passwordResetToken: { // unselect
    type: String,
  },
  passwordResetExpires: { // unselect
    type: Date,
  },
  boughtProducts: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
    },
  ],
  loginOTP: { // unselect
    type: Number,
  },
  guestOTP: { // unselect
    type: Number,
  },
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

customerSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000

  return resetToken
}

customerSchema.index({
  name: 'text',
  phone: 'text',
  email: 'text',
  city: 'text',
  pincode: 'text',
})

const Customer = new mongoose.model('Customer', customerSchema)
module.exports = Customer

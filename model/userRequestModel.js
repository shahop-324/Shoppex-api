const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userRequestSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Buyer', 'Seller'],
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  shopName: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: { type: String },
  password: {
    type: String,
  },
  otp: {
    type: String,
  },
  referralCode: {
    type: String,
  },
})

userRequestSchema.pre('save', async function (next) {
  //Only run this function  if password was actually modified
  if (!this.isModified('password')) {
    return next()
  }
  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12)

  next()
})

userRequestSchema.pre('save', async function (next) {
  // Only run this function if OTP was actually modified
  if (!this.isModified('otp')) {
    return next()
  }
  // Hash the OTP with cost of 12
  this.otp = await bcrypt.hash(this.otp, 12)

  next()
})

userRequestSchema.methods.correctOTP = async function (
  candidateOTP,
  userRequestOTP,
) {
  return await bcrypt.compare(candidateOTP, userRequestOTP)
}

const UserRequest = new mongoose.model('UserRequest', userRequestSchema)
module.exports = UserRequest
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const otpGenerator = require('otp-generator')

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: { type: String },
  password: {
    type: String,
  },
  passwordChangedAt: {
    type: Date,
  },
  stores: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Store',
    },
  ],
  referralCode: {
    type: String,
    default: otpGenerator.generate(8, {
      upperCaseAlphabets: true,
      specialChars: false,
      lowerCaseAlphabets: false,
    }),
  },
})

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
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

const User = mongoose.model('User', userSchema)
module.exports = User

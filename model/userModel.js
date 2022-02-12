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
  passwordConfirm: {
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
  image: {
    type: String,
  },

  referralCode: {
    type: String,
    default: otpGenerator.generate(8, {
      upperCaseAlphabets: true,
      specialChars: false,
      lowerCaseAlphabets: false,
    }),
  },
  refCode: {
    // This is the referral code used by this user to sign up on qwikshop
    type: String,
  },
  referredBy: {
    // This is the id of a user who referred this person to sign up on qwikshop
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  referredUsers: [
    {
      // These are users who have successfully signed up via this user's referral
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
  upgradedByRefUsers: [
    {
      // These are users who have successfully signed up via this user's referral and also upgraded to a premium plan
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
  plan: {
    type: String,
    enum: ['Trial', 'Monthly', 'Yearly', 'Lifetime'],
    default: 'Trial',
  },
  upgraded: {
    type: Boolean,
    defauult: false,
  },
  joinedAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
  },
});

userSchema.pre(/^find/, function (next) {
  this.find({})
    .populate('stores')
    .populate(
      'referredUsers',
      'firstName lastName email phone joinedAt upgraded plan',
    )
    .populate(
      'upgradedByRefUsers',
      'firstName lastName email phone joinedAt upgraded plan',
    )
  next()
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

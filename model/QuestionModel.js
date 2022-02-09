const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
  },
  answer: {
    type: String,
  },
  foundHelpful: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Customer',
    },
  ],
  foundNotHelpful: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Customer',
    },
  ],
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Customer',
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
  },
  visible: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  answeredAt: {
    type: Date,
  },
  answeredBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  featured: {
    type: Boolean,
    default: false,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
  pinned: {
    type: Boolean,
    default: false,
  }
})

questionSchema.pre(/^find/, function (next) {
  this.find({}).populate('customer').populate('product').populate('answeredBy')
  next()
})

const Question = new mongoose.model('Question', questionSchema)
module.exports = Question
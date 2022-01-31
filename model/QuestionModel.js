const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.ObjectId, ref: 'Store' },
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Customer',
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
  },
  question: {
    type: String,
  },
  answer: {
    type: String,
  },
  answeredBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date },
  foundUseful: [{ type: mongoose.Schema.ObjectId, ref: 'Customer' }],
  foundNotUseful: [{ type: mongoose.Schema.ObjectId, ref: 'Customer' }],
})

const Question = new mongoose.model('Question', questionSchema)

module.exports = Question

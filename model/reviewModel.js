const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.ObjectId,
    ref: "Store",
  },
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Customer',
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
  },
  rating: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
  },
  comment: {
    type: String,
  },
  images: [
    {
      type: String,
    },
  ],
  video: { type: String },
  visible: { type: Boolean, default: true },
  isTestemonial: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date },
  foundUseful: [{ type: mongoose.Schema.ObjectId, ref: 'Customer' }],
  foundNotUseful: [{ type: mongoose.Schema.ObjectId, ref: 'Customer' }],
})

const Review = new mongoose.model('Review', reviewSchema)

module.exports = Review
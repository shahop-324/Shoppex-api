const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Buyer',
  },
  rating: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
  },
  review: {
    type: String,
  },
  images: [
    {
      type: String,
    },
  ],
})

const Review = new mongoose.model('Review', reviewSchema)

module.exports = Review

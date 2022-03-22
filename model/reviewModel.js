const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
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
  videos: [{ type: String }],
  visible: { type: Boolean, default: true },
  isTestemonial: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now() }, // unselect
  updatedAt: { type: Date }, // unselect
  foundHelpful: [{ type: mongoose.Schema.ObjectId, ref: 'Customer' }],
  foundNotHelpful: [{ type: mongoose.Schema.ObjectId, ref: 'Customer' }],
  tags: [{type: String,},],
  accepted: { 
    type: Boolean, 
    default: false,
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
  },
  audited: {
    type: Boolean,
    default: false,
  }
})

reviewSchema.pre(/^find/, function (next) {
  this.find({}).populate('customer').populate('product')
  next()
})

const Review = new mongoose.model('Review', reviewSchema);
module.exports = Review;

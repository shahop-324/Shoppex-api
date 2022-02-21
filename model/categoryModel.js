const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  products: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
    },
  ],
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
  },
  subCategories: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'SubCategory',
    },
  ],
  outOfStock: {
    type: Boolean,
    default: false,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
  totalSales: {
    type: Number,
    default: 0,
  },
  createdAt: { type: Date, },
  updatedAt: { type: Date, default: Date.now() },
})

categorySchema.pre(/^find/, function (next) {
  this.find({}).populate('subCategories');
  next()
})

categorySchema.index({
  name: 'text',
})

const Category = new mongoose.model('Category', categorySchema)

module.exports = Category

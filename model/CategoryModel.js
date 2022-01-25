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
})

const Category = new mongoose.model('Category', categorySchema)

module.exports = Category

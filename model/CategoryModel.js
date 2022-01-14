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
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: 'Shop',
  },
})

const Category = new mongoose.model('Category', categorySchema)

module.exports = Category

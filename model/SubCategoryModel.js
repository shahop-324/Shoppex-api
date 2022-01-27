const mongoose = require('mongoose')

const subCategorySchema = new mongoose.Schema({
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  category: { type: Map },
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

subCategorySchema.index({
  name: 'text',
})

const SubCategory = new mongoose.model('SubCategory', subCategorySchema)

module.exports = SubCategory

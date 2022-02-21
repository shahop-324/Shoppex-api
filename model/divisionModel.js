const mongoose = require('mongoose')

const divisionSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  subCategory: { type: Map },
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
  createdAt: { type: Date, },
  updatedAt: { type: Date, default: Date.now() },
})

divisionSchema.index({
  name: 'text',
})

const Division = new mongoose.model('Division', divisionSchema)

module.exports = Division

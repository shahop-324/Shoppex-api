const mongoose = require('mongoose')

const sizeSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  maximumRetailPrice: {
    type: Number,
  },
  sellingPrice: {
    type: Number,
  },
})

const productSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
  },
  maximumRetailPrice: {
    type: Number,
  },
  sellingPrice: {
    type: Number,
  },
  images: [
    {
      type: String,
    },
  ],
  unit: {
    type: String,
    enum: [
      'Piece',
      'Kg',
      'gm',
      'ml',
      'litre',
      'mm',
      'ft',
      'meter',
      'sq. ft.',
      'sq. meter',
      'km',
      'set',
      'hour',
      'day',
      'bunch',
      'bundle',
      'month',
      'year',
      'service',
      'work',
      'packet',
      'box',
      'pound',
      'dozen',
      'gunta',
      'pair',
      'minute',
      'qunital',
      'ton',
      'capsule',
      'tablet',
      'plate',
      'inch',
    ],
  },
  unitQuantity: {
    type: Number,
  },
  description: {
    type: String,
  },
  unitsAvailable: {
    type: Number,
  },
  sizes: [sizeSchema],
  color: [{ type: String }],
  inStock: {
    type: Boolean,
    default: true,
  },
})

const Product = mongoose.model('Product', productSchema)
module.exports = Product

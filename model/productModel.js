const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
  },
  productType: {
    type: Map,
  },
  productName: {
    type: String,
  },
  category: {
    type: Map,
  },
  subCategory: {
    type: Map,
  },
  price: {
    type: Number,
  },
  discountedPrice: {
    type: Number,
  },
  wholesalePrice: {
    type: Number,
  },
  minWholesaleQuantity: {
    type: Number,
  },
  isFragile: { type: Boolean },
  isVeg: {
    type: Boolean,
  },
  acceptCOD: { type: Boolean },
  description: { type: String },
  productUnit: { type: Map },
  productSKU: { type: String },
  weight: { type: Number },
  quantityInStock: { type: Number },
  minQuantitySold: { type: Number },
  dimensionUnit: {
    type: Map,
  },
  length: { type: Number },
  width: { type: Number },
  height: { type: Number },
  InTheBox: [{ type: Map }],
  colorsList: [{ type: Map }],
  variantList: [{ type: Map }],
  customVariants: [{ type: Map }],
  metaDescription: { type: String },
  metaTitle: { type: String },
  metaKeyword: { type: String },
  addOnList: [{ type: Map }],
  images: [{ type: String }],
  videos: [{ type: String }],
  outOfStock: { type: Boolean, default: false },
  hidden: { type: Boolean, default: false },
  totalSales: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
})

productSchema.index({
  productName: 'text',
  metaDescription: 'text',
  metaTitle: 'text',
  metaKeyword: 'text',
  productSKU: 'text',
  description: 'text',
})

const Product = mongoose.model('Product', productSchema)
module.exports = Product

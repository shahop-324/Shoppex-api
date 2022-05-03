const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  upcoming: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
  },
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
  specifications: [{ type: Map }],
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
  brand: {type: String,},
  rating: {type: Number, default: 0,},
  numberOfRatings: {type: Number, default: 0,},
  lowestPrice:{type: Number,},
  highestPrice: {type: Number,},
  featured: {type: Boolean, default: false,},
  views: {
    type: Number,
    default: 0,
  },
  orders: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Order',
    },
  ],
  createdAt: { type: Date, default: Date.now() }, // unselect
  updatedAt: { type: Date, default: Date.now() }, // unselect
  freeDelivery: {type: Boolean, default: false,},
  priceDeterminingVariant: {type: String,},
  shopCategory: {
    type: Map,
  },
  shopSubCategory: {
    type: Map,
  },
  
  reviewedBy: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Customer',
    },
  ],
})

productSchema.index({
  productName: 'text',
  metaDescription: 'text',
  metaTitle: 'text',
  metaKeyword: 'text',
  productSKU: 'text',
  description: 'text',
})

const Product = new mongoose.model('Product', productSchema)
module.exports = Product
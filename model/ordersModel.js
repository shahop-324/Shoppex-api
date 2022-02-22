const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  ref: { type: String },
  store: { type: mongoose.Schema.ObjectId, ref: 'Store' },
  customer: { type: mongoose.Schema.ObjectId, ref: 'Customer' },
  shipment: { type: mongoose.Schema.ObjectId, ref: 'Shipment' },
  referral: {type: mongoose.Schema.ObjectId, ref: 'Referral'},
  createdAt: { type: Date, default: Date.now() },
  shippingAddress: { type: Map },
  billingAddress: { type: Map },
  taxData: { type: Map },
  billingMode: { type: String },
  note: { type: String },
  couponId: { type: mongoose.Schema.ObjectId, ref: 'Discount' },
  discountType: { type: String },
  deliveryCharge: { type: Number },
  paymentStatus: {
    type: String,
    default: 'Awaiting',
    enum: ['Awaiting', 'Recieved'],
  },
  orderStatus: {
    type: String,
    enum: ['packaging', 'shipping', 'delivering', 'complete', 'cancelled'],
  },
  status: {
    type: String,
    default: 'Pending',
    enum: [
      'Pending',
      'Cancelled',
      'Accepted',
      'Rejected',
      'Returned',
      'Replaced',
      'Requested Return',
      'Requested Replacement',
    ],
  },
  items: [
    {
      product: { type: mongoose.Schema.ObjectId, ref: 'Product' },
      quantity: { type: Number },
      variants: [
        {
          index: { type: String },
          quantity: { type: Number },
          selectedOption: { type: String },
        },
      ], // {type: String or index of variant available types, value: index of variant},
      color: { type: String },
      pricePerUnit: { type: Number },
      availableQuantity: { type: Number },
    },
  ],
  givenProducts: [
    {type: Map,}
  ],
  freeProducts: [{
    productId: { type: mongoose.Schema.ObjectId, ref: 'Product' },
    quantity: { type: Number },
   
  },],
  charges: { type: Map },
  appliedCoins: { type: Number, default: 0 },
  paymentMode: { type: String },
  estimatedDelivery: {
    type: Date,
    default: Date.now() + 2 * 24 * 60 * 60 * 1000,
  },
  coinsUsed: { type: Number, default: 0 },
  coinsEarned: { type: Number, default: 0 },
  amountToConfirm: { type: Number },
  paidAmount: { type: Number, default: 0 },
  reasonForCancellation: {
    type: String,
  },
})

orderSchema.pre(/^find/, function (next) {
  this.find({}).populate('customer').populate('referral')
  next()
})

orderSchema.index({
  ref: 'text',
  paymentMode: 'text',
  status: 'text',
  orderStatus: 'text',
  discountType: 'text',
  billingMode: 'text',
  note: 'text',
})

const Order = mongoose.model('Order', orderSchema)
module.exports = Order

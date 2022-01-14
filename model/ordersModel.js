const mongoose = require('mongoose')

const itemsSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
  },
  unit: {
    type: Number,
  },
  size: {
    type: String,
  },
  color: {
    type: String,
  },
})

const discountSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    type: {
        type: String,
        enum: ["flat", "percentage"],
    },
    flatDiscount: {
        type: Number,
    },
    percentageDiscount: {
        type: Number,
    },
});

const chargesSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    type: {
        type: String,
        enum: ["flat", "percentage"],
    },
    flatCharge: {
        type: Number,
    },
    percentageCharge: {
        type: Number,
    },
})

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Customer',
  },
  address: { type: mongoose.Schema.ObjectId, ref: 'BuyerAddress' },
  products: [itemsSchema],
  shopId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Shop',
  },
  payementMethod: {
    type: String,
  },
  paymentAmount: {
    type: Number,
  },
  timestamp: {
    type: Date,
    default: Date.now(),
  },
  itemsTotal: {
    type: Number,
  },
  discounts: [discountSchema],
  charges: [chargesSchema],
  grandTotal: {
      type: Number,
  },
  status: {
      type: String,
      enum: ["Accepted", "Rejected"],
  },
})

const Order = mongoose.model('Order', orderSchema)
module.exports = Order

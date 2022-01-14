const mongoose = require('mongoose')

const discountSchema = new mongoose.Schema({
  discountCode: {
    type: String,
  },
  type: {
    type: String,
    enum: ['Percentage', 'Flat'],
  },
  percentage: {
    type: Number,
  },
  minimumOrderValue: {
    type: Number,
  },
  maximumDiscountValue: {
    type: Number,
  },
  flatDiscount: {
    type: Number,
  },
  showToCustomers: {
    type: Boolean,
    default: true,
  },
  usedOnOrders: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Order',
    },
  ],
  active: {
      type: Boolean,
      default: true,
  },
  deleted: {
      type: Boolean,
      default: false,
  },
});

const Discount = new mongoose.model('Discount', discountSchema)

module.exports = Discount

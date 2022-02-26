const mongoose = require('mongoose')

const discountSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.ObjectId, ref: 'Store' },
  discountType: { type: String },
  applicableOn: { type: String },
  type: { type: String },
  applicableFromDateTime: { type: Date },
  applicableTillDateTime: { type: Date },
  buyX: { type: Number },
  getY: { type: Number },
  boughtProduct: { type: Map },
  givenProduct: { type: Map },
  applicableCategories: [{ type: Map }],
  applicableSubCategories: [{ type: Map }],
  applicableDivisions: [{type: Map,}],
  applicableProducts: [{ type: Map }],
  numberOfCoupons: { type: Number },
  totalUsed: { type: Number, default: 0 },
  discountCode: { type: String },
  usesPerCustomer: { type: Number },
  discountPercentage: { type: Number },
  discountAmount: { type: Number },
  minOrderValue: { type: Number },
  maxDiscount: { type: Number },
  showToCustomer: { type: Boolean, default: true },
  usedByCustomers: [{ type: mongoose.Schema.ObjectId, ref: 'Customer' }],
  totalSales: { type: Number },
  appliedOnOrders: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Order',
    },
  ],
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
  },
})

const Discount = new mongoose.model('Discount', discountSchema)

module.exports = Discount

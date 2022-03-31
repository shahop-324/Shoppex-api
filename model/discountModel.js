const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.ObjectId, ref: "Store" },
  discountType: { type: String },
  applicableOn: { type: String },
  type: { type: String },
  applicableFromDateTime: { type: Date },
  applicableTillDateTime: { type: Date },
  buyX: { type: Number, default: 1 },
  getY: { type: Number, default: 1 },
  boughtProduct: { type: Map },
  givenProduct: { type: Map },
  applicableCategories: [{ type: Map }],
  applicableSubCategories: [{ type: Map }],
  applicableProducts: [{ type: Map }],
  numberOfCoupons: { type: Number },
  totalUsed: { type: Number, default: 0 },
  discountCode: { type: String },
  usesPerCustomer: { type: Number, default: 1 },
  discountPercentage: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 10 },
  minOrderValue: { type: Number, default: 1000 },
  maxDiscount: { type: Number, default: 10 },
  showToCustomer: { type: Boolean, default: true },
  usedByCustomers: [{ type: mongoose.Schema.ObjectId, ref: "Customer" }],
  totalSales: { type: Number },
  appliedOnOrders: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Order",
    },
  ],
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    // unselect
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    // unselect
    type: Date,
  },
});

const Discount = new mongoose.model("Discount", discountSchema);

module.exports = Discount;

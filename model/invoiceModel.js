const mongoose = require("mongoose");

const customProductSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  price: {
    type: Number,
  },
  selling_price: {
    type: Number,
  },
  quantity: {
    type: Number,
  },
  sku: {
    type: String,
  },
});

const extraChargeSchema = new mongoose.Schema({
  label: {
    type: String,
  },
  type: {
    type: String,
    enum: ["Flat", "Percentage"],
  },
  percentage: {
    type: Number,
  },
  amount: {
    type: Number,
  },
});

const discountSchema = new mongoose.Schema({
  label: {
    type: String,
  },
  type: {
    type: String,
    enum: ["Flat", "Percentage"],
  },
  percentage: {
    type: Number,
  },
  amount: {
    type: Number,
  },
});

const inventoryProductSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
  },
  quantity: {
    type: Number,
  },
  variants: {
    type: Map,
    of: String,
  },
});

const invoiceSchema = new mongoose.Schema({
  ref: {
    // Custom ID
    type: String,
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: "Store",
  },
  products: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
  ],
  customProducts: [customProductSchema],
  timestamp: {
    type: Date,
    default: Date.now(),
  },
  payment_link: {
    type: String,
  },
  note: {
    type: String,
  },
  amount_total: {
    type: Number,
  },
  amount_paid: {
    type: Number,
  },
  amount_unpaid: {
    type: Number,
  },
  payment_link_status: {
    type: String,
    enum: ["created", "partially_paid", "expired", "cancelled", "paid"],
  },
  status: {
    type: String,
    default: "Unpaid",
    enum: ["Unpaid", "Paid"],
  },
  customer_id: {
    type: mongoose.Schema.ObjectId,
    ref: "Customer",
  },
  accept_partial: {
    type: Boolean,
    default: false,
  },
  cancelled_at: {
    // timestamp at which payment link is cancelled ()
    type: Date,
  },
  first_min_partial_amount: {
    type: Number,
  },
  subtotal: {
    type: Number,
  },
  extra_charges: [extraChargeSchema],
  discounts: [discountSchema],
});

const Invoice = new mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;

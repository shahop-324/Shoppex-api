const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  id: {type: String,},
  ref: { type: String },
  store: { type: mongoose.Schema.ObjectId, ref: "Store" },
  customer: { type: mongoose.Schema.ObjectId, ref: "Customer" },
  shipment: { type: mongoose.Schema.ObjectId, ref: "Shipment" },
  referral: { type: mongoose.Schema.ObjectId, ref: "Referral" },
  createdAt: { type: Date, default: Date.now() }, // unselect
  shippingAddress: { type: Map },
  billingAddress: { type: Map },
  taxData: { type: Map },
  billingMode: { type: String },
  note: { type: String },
  couponId: { type: mongoose.Schema.ObjectId, ref: "Discount" },
  discountType: { type: String },
  deliveryCharge: { type: Number },
  paymentStatus: {
    type: String,
    default: "Awaiting",
    enum: ["Awaiting", "Recieved"],
  },
  status: {
    type: String,
    enum: [
      "Waiting For Acceptance",
      "Accepted",
      "AWB Assigned",
      "Label Generated",
      "Pickup Scheduled/Generated",
      "Pickup Queued",
      "Manifest Generated",
      "Shipped",
      "Delivered",
      "Cancelled",
      "RTO Initiated",
      "RTO Delivered",
      "Pending",
      "Lost",
      "Pickup Error",
      "RTO Acknowledged",
      "Pickup Rescheduled",
      "Cancellation Requested",
      "Out For Delivery",
      "In Transit",
      "Out For Pickup",
      "Pickup Exception",
      "Undelivered",
      "Delayed",
      "Partial_Delivered",
      "Destroyed",
      "Damaged",
      "Fulfilled",
      "Reached at Destination",
      "Misrouted",
      "RTO NDR",
      "RTO OFD",
      "Picked Up",
      "Self Fulfilled",
      "DISPOSED_OFF",
      "CANCELLED_BEFORE_DISPATCHED",
      "RTO_IN_TRANSIT",
      "QC Failed",
      "Reached Warehouse",
      "Custom Cleared",
      "In Flight",
      "Handover to Courier",
      "Shipment Booked",
      "In Transit Overseas",
      "Connection Aligned",
      "Reached Overseas Warehouse",
      "Custom Cleared Overseas",
      "Box Packing",
    ],
    default: "Waiting For Acceptance",
  },
  status_id: {
    type: Number,
    enum: [
      -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
      20, 21, 22, 23, 24, 25, 26, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48,
      49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
    ],
    default: -1,
  },
  etd: {
    type: Date,
  },
  courier_name: {
    type: String,
  },
  scans: [
    {
      date: {
        type: Date,
      },
      activity: {
        type: String,
      },
      location: {
        type: String,
      },
    },
  ],
  items: [
    {
      product: { type: mongoose.Schema.ObjectId, ref: "Product" },
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
  givenProducts: [{ type: Map }],
  freeProducts: [
    {
      productId: { type: mongoose.Schema.ObjectId, ref: "Product" },
      quantity: { type: Number },
    },
  ],
  charges: { type: Map },
  appliedCoins: { type: Number, default: 0 },
  paymentMode: { type: String },
  coinsUsed: { type: Number, default: 0 },
  coinsEarned: { type: Number, default: 0 },
  amountToConfirm: { type: Number },
  paidAmount: { type: Number, default: 0 },
  reasonForCancellation: {
    type: String,
  },
  deliveredOn: {
    type: Date,
  },
  carrier: {
    type: String,
  },
  paymentLinkId: {
    type: String,
  },
  paymentLink: {
    type: String,
  },
  partially_paid: {
    type: Boolean,
    default: false,
  },
  paid_amount: {
    type: Number,
    default: 0,
  },
  paid_fully: {
    type: Boolean,
    default: false,
  },
});

orderSchema.pre(/^find/, function (next) {
  this.find({}).populate("customer").populate("referral");
  next();
});

orderSchema.index({
  ref: "text",
  paymentMode: "text",
  status: "text",
  orderStatus: "text",
  discountType: "text",
  billingMode: "text",
  note: "text",
});

const Order = new mongoose.model("Order", orderSchema);
module.exports = Order;

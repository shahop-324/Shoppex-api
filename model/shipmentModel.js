const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.ObjectId,
    ref: "Store",
  },
  order: {
    type: mongoose.Schema.ObjectId,
    ref: "Order",
  },
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: "Customer",
  },
  orderRef: {
    type: String,
  },
  AWB: { type: String }, // WayBill Number
  expectedDelivery: { type: Date },
  charge: { type: Number },
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
  createdAt: { type: Date, default: Date.now() },
  carrier: {
    type: String,
    enum: ["Delhivery", "Shiprocket", "Self"],
  },
  reasonForCancellation: {
    type: String,
  },
  shiprocket_order_id: {
    type: String,
  },
  shiprocket_shipment_id: {
    type: String,
  },
  pickup_time: {
    type: Date,
  },
  courier_company_id: {
    type: String,
  },
  applied_weight: {
    type: Number,
  },
  courier_name: {
    type: String,
  },
  routing_code: {
    type: String,
  },
  invoice_no: {
    type: String,
  },
  transporter_id: {
    type: String,
  },
  transporter_name: {
    type: String,
  },
  deliveredOn: {
    type: Date,
  },
});

shipmentSchema.pre(/^find/, function (next) {
  this.find({}).populate("customer").populate("order");
  next();
});

shipmentSchema.index({
  orderRef: "text",
  status: "text",
  carrier: "text",
});

const Shipment = new mongoose.model("Shipment", shipmentSchema);
module.exports = Shipment;

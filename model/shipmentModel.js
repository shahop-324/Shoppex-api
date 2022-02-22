const mongoose = require('mongoose')

const shipmentSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
  },
  order: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
  },
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Customer',
  },
  orderRef: {
    type: String,
  },
  AWB: { type: String }, // WayBill Number
  expectedDelivery: { type: Date },
  charge: { type: Number },
  status: {
    type: String,
    default: 'Preparing for shipment',
    enum: [
      'Preparing for shipment',
      'Shipped',
      'In Transit',
      'Out for delivery',
      'Delivered',
      'Cancelled',
    ],
  },
  createdAt: { type: Date, default: Date.now() },
  carrier: {
    type: String,
    enum: ['Delhivery', 'Shiprocket', 'Self'],
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
  AWB: {
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
})

shipmentSchema.pre(/^find/, function (next) {
  this.find({}).populate('customer').populate('order')
  next()
})

shipmentSchema.index({
  orderRef: 'text',
  status: 'text',
  carrier: 'text',
})

const Shipment = new mongoose.model('Shipment', shipmentSchema)

module.exports = Shipment

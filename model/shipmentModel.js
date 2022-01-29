const mongoose = require('mongoose')

const shipmentSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
  },
  order: {
    type: mongoose.Schema.ObjectId,
    ref: 'Buyer',
  },
  orderRef: {
    type: String,
  },
  carrier: {
    type: String,
  },
  trackingLink: { type: String },
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
})

shipmentSchema.index({
  orderRef: 'text',
  status: 'text',
  carrier: 'text',
})

const Shipment = new mongoose.model('Shipment', shipmentSchema)

module.exports = Shipment

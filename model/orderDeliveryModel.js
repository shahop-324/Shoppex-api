const mongoose = require('mongoose')

const orderDeliverySchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
  },
  carrier: {
    type: String,
    enum: ['ShipRocket', 'Dunzo', 'Self Delivery', 'Delhivery', "Shyplite"],
  },
  status: {
    type: String,
    enum: [
      'Preparing for shipment',
      'Ready to ship',
      'In transit',
      'Delivered',
    ],
    default: 'Preparing for shipment',
  },
  location: {
    type: String,
  },
  lastUpdatedAt: {
    type: Date,
  },
  phoneNumber: {
    type: String,
  },
  expectedToBeDeliveredAt: {
    type: Date,
  },
  selfDeliveryCode: {
      type: String,
  },
})

const OrderDelivery = new mongoose.model('OrderDelivery', orderDeliverySchema)

module.exports = OrderDelivery

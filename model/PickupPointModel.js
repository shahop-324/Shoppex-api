const mongoose = require('mongoose')

const pickupPointSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.ObjectId, ref: 'Store' },
  addressType: {
    type: String,
  },
  pickupPointName: {
    type: String,
  },
  country: { type: Map },
  state: { type: String },
  city: { type: String },
  address: { type: String },
  pincode: { type: Number },
  landmark: { type: String },
  phone: { type: String },
  contactPersonName: { type: String },
  contactEmail: { type: String },
  operational: { type: Boolean, default: true },
});

pickupPointSchema.index({
    addressType: 'text',
    pickupPointName: 'text',
    state: 'text',
    city: 'text',
    landmark: 'text',
    contactPersonName: 'text',
    contactEmail: 'text',
    phone: 'text',
    address: 'text',
})

const PickupPoint = new mongoose.model('PickupPoint', pickupPointSchema)

module.exports = PickupPoint
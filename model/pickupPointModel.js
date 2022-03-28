const mongoose = require("mongoose");

const pickupPointSchema = new mongoose.Schema({
  id: { type: String },
  store: { type: mongoose.Schema.ObjectId, ref: "Store" },
  addressType: {
    type: String,
  },
  pickupPointName: {
    type: String,
  },
  warehouse_name: {
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
  shiprocket_data: {
    type: Map,
  },
});

pickupPointSchema.index({
  addressType: "text",
  pickupPointName: "text",
  state: "text",
  city: "text",
  landmark: "text",
  contactPersonName: "text",
  contactEmail: "text",
  phone: "text",
  address: "text",
});

const PickupPoint = new mongoose.model("PickupPoint", pickupPointSchema);

module.exports = PickupPoint;

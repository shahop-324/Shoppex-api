const mongoose = require("mongoose");

const pickupPointSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.ObjectId,
        ref: "Shop",
    },
    address: {
        type: String, // Street, Colony, Flat or Building Name or No.
    },
    landmark: {
        type: String, // Well known nearby location
    },
    pincode: {
        type: String, // 6 digit pincode
    },
    state: {
        type: String, // 
    },
    city: {
        type: String,
    },
    country: {
        type: String,
    },
});

const PickupPoint = new mongoose.model("PickupPoint", pickupPointSchema);

module.exports = PickupPoint;
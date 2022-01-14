const mongoose = require("mongoose");

const buyerAddressSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.ObjectId,
        ref: "Buyer",
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

const BuyerAddress = new mongoose.model("BuyerAddress", buyerAddressSchema);

module.exports = BuyerAddress;
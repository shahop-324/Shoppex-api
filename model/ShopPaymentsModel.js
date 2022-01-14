const mongoose = require("mongoose");

const shopPaymentSchema = new mongoose.Schema({
    date: {
        type: Date,
    },
    transferredTo: {
        type: mongoose.Schema.ObjectId,
        ref: "ShopConnectedAccount",
    },
    amount: {
        type: Number,
    },
    shop: {
        type: mongoose.Schema.ObjectId,
        ref: "Shop",
    },
});

const ShopPayment = new mongoose.model("ShopPayment", shopPaymentSchema);
module.exports = ShopPayment;
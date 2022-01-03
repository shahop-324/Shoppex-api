const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.ObjectId,
        ref: "Customer",
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
    },
    shopId: {
        type: mongoose.Schema.ObjectId,
        ref: "Shop",
    },
    payementMethod: {
        type: String,
    },
    paymentAmount: {
        type: Number,
    },
    timestamp: {
        type: Date,
        default: Date.now(),
    }
})




const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
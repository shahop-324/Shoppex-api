const mongoose = require("mongoose");

const orderTransactionSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.ObjectId,
        ref: "Order",
    },
    processedVia: {
        type: String,
        enum: ["Razorpay", "PhonePe", "GooglePay", "Paytm", "AmazonPay"],
    },
    transactionId: {
        type: String,
    },
    createdAt: {
        type: Date,
    },
    amount: {
        type: Number,
    },
    status: {
        type: String,
        enum: ["Failed", "Succeded", "Processing"],
    },
});

const OrderTransaction = new mongoose.model("OrderTransaction", orderTransactionSchema);

module.exports = OrderTransaction;
const mongoose = require("mongoose");

const refundPolicySchema = new mongoose.Schema({
    policy: {
        type: String,
    },
    shop: {
        type: mongoose.Schema.ObjectId,
        ref: "Shop",
    },
    createdAt: {
        type: Date,
    },
    updatedAt: {
        type: Date,
    },
});

const RefundPolicy = new mongoose.model("RefundPolicy", refundPolicySchema);
module.exports = RefundPolicy;
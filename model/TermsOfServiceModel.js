const mongoose = require("mongoose");

const termsOfServicePolicySchema = new mongoose.Schema({
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

const TermsOfService = new mongoose.model("TermsOfService", termsOfServicePolicySchema);
module.exports = TermsOfService;
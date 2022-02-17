const mongoose = require("mongoose");

const privacyPolicySchema = new mongoose.Schema({
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

const PrivacyPolicy = new mongoose.model("PrivacyPolicy", privacyPolicySchema);
module.exports = PrivacyPolicy;

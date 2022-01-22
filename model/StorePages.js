const mongoose = require('mongoose');

const storePagesSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    slug: {
        type: String,
    },
    html: {
        type: String,
    },
    store: {
        type: mongoose.Schema.ObjectId,
        ref: "Store",
    },
    updatedAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
    },
});

const StorePages = mongoose.model("StorePages", storePagesSchema);
module.exports = StorePages;
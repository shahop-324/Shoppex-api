const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
    store: {
        type: mongoose.Schema.ObjectId,
        ref: "Store"
    },
    level: {
        type: String,
        enum: ["One", "Two", "Three"],
    },
    parent: {
        type: Map,
        of: String,
    },
    menuType: {
        type: Map,
    },
    itemName: {
        type: String,
    },
    product: {
        type: Map,
    },
    category: {
        type: Map,
    },
    subCategory: {
        type: Map,
    },
    division: {
        type: Map,
    },
    page: {
        type: Map,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    updatedAt: {
        type: Date,
    },
});

const Menu = new mongoose.model("Menu", menuSchema);
module.exports = Menu
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    price: {
        type: Number,
    },
    currency: {
        type: String,
        enum: ["INR", "USD"],
    }
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
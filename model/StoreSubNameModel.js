const mongoose = require('mongoose');

const storeSubNameSchema = new mongoose.Schema({
    subName: {
        type: String,
    },
    store: {
        type: mongoose.Schema.ObjectId,
        ref: "Store",
    },
    createdAt: {
        type: Date,
    },
    updatedAt: {
        type: Date,
    },
});

const StoreSubName = new mongoose.model('StoreSubName', storeSubNameSchema);
module.exports = StoreSubName;
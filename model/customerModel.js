const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
    },
    profilePic: {

        type: String,

    },
    mobile: { type: String },
    defaultAddress: { type: String },

});

const customer = mongoose.model("User", customerSchema);
module.exports = customer;
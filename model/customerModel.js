const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Shop',
  },
  customers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Buyer',
    },
  ],
})

const Customer = mongoose.model('Customer', customerSchema)
module.exports = Customer

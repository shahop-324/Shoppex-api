const mongoose = require('mongoose')

const buyerSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  image: {
      type: String,
  },
  mobile: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  addresses: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'BuyerAddressModel',
    },
  ],
  cart: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
    },
  ],
  transactions: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'ProductTransaction',
    },
  ],
  orders: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Order',
    },
  ],
})

const Buyer = new mongoose.model('Buyer', buyerSchema)
module.exports = Buyer

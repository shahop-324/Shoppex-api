const mongoose = require('mongoose')

const staffMemberSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  phone: {
    type: String,
  },
  lastLoggedIn: {
    type: Date,
  },
  role: {
    type: String,
    enum: ['Admin', 'Staff'],
  },
  permissions: [
    {
      type: String,
      enum: [
        'Order',
        'Catalouge',
        'Delivery',
        'Customer',
        'Dining',
        'Marketing',
        'Payment',
        'Discount',
        'Manage',
        'Design',
        'Integration',
        'Reviews',
        'Reports',
      ],
    },
  ],
  addedAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
})

const checkoutFieldSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  type: {
    type: String,
  },
  required: {
    type: Boolean,
    default: true,
  },
  options: [{ type: String }],
})

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  subName: {
    type: String,
  },
  email: {
    type: String,
  },
  team: [staffMemberSchema],
  formFields: [checkoutFieldSchema],
  guestCheckout: {
    type: Boolean,
    default: true,
  },
})

const Store = mongoose.model('Store', storeSchema)
module.exports = Store

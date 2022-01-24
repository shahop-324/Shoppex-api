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
  setupCompleted: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
  },
  country: {
    type: String,
  },
  state: {
    type: String,
  },
  city: {
    type: String,
  },
  pincode:  {
    type: Number,
  },
  address: {
    type: String,
  },
  landmark: {
    type: String,
  },
  gstin: {
    type: String,
  },
  subName: {
    type: String,
  },
  category: {
    type: String,
  },
  phone: {
    type: String,
  },
  logo: {type: String,},
  email: {
    type: String,
  },
  team: [staffMemberSchema],
  formFields: [checkoutFieldSchema],
  guestCheckout: {
    type: Boolean,
    default: true,
  },
  productsSold: {
    type: Number,
    default: 0,
  },
  customers: {
    type: Number, 
    default: 0,
  },
  storeViews: {
    type: Number,
    default: 0,
  },
  amountOnHold: {
    type: Number,
    default: 0,
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date, 
    default: Date.now(),
  }
})

const Store = mongoose.model('Store', storeSchema)
module.exports = Store

// This model will store all invitations for people from other stores who are yet to sign up on this platform

// If user is already is on platform on this platform then we would directly add them

const mongoose = require('mongoose')

const staffInvitationSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.ObjectId },
  name: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: { type: String },
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
  createdAt: {
      type: Date,
      default: Date.now(),
  },
})

const StaffInvitation = mongoose.model('StaffInvitation', staffInvitationSchema)
module.exports = StaffInvitation

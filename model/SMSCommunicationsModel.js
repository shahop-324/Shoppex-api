const mongoose = require('mongoose')

const smsCommunicationsSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Customer',
  },
  message: {type: String,},
})

const SMSCommunications = new mongoose.model(
  'SMSCommunications',
  smsCommunicationsSchema,
)
module.exports = SMSCommunications

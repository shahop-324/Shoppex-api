const mongoose = require('mongoose')

const mailchimpSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store,',
  },
  dc: { type: String },
  role: { type: String },
  accountName: { type: String },
  user_id: { type: String },
  login: {
    type: Map,
  },
  login_url: { type: String },
  api_endpoint: { type: String },
  createdAt: { type: Date, default: Date.now() },
})

const Mailchimp = new mongoose.model('Mailchimp', mailchimpSchema)
module.exports = Mailchimp

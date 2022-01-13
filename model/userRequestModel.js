const mongoose = require('mongoose')

const userRequestSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  shopName: {
    type: String,
  },
  phone: {
    type: String,
  },
})

const UserRequest = mongoose.model('UserRequest', userRequestSchema)
module.exports = UserRequest

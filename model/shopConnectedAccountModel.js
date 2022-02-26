const mongoose = require('mongoose')

const shopConnectedAccountSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: 'Shop',
  },
  type: {
    type: String,
    enum: ['UPI', 'Bank Account'],
  },
  // UPI ID
  upiId: {
    type: String,
  },
  // Bank Account details
  benificiaryName: {
    type: String,
  },
  accountNo: {
    type: String,
  },
  IFSCCode: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Verified', 'unverified'],
  },
})

const ShopConnectedAccount = new mongoose.model("ShopConnectedAccount", shopConnectedAccountSchema);
module.exports = ShopConnectedAccount;

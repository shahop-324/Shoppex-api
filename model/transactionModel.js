const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'Payout',
      'Customer Order',
      'Seller subscription',
      'Seller wallet recharge',
      'Seller wallet transaction',
    ],
    default: 'Customer Order',
  },
  store: { type: mongoose.Schema.ObjectId, ref: 'Store' },
  customer: { type: mongoose.Schema.ObjectId, ref: 'Customer' },
  order: { type: mongoose.Schema.ObjectId, ref: 'Order' },
  createdAt: { type: Date, default: Date.now() },
  fee: {
    type: Number,
  },
  tax: {
    type: Number,
  },
  acquirerData: {
    type: Map,
  },
  vpa: {
    type: String,
  },
  description: {
    type: String,
  },
  order_id: {
    type: String,
  },
  status: {
    type: String,
  },
  currency: {
    type: String,
  },
  amount: {
    type: Number,
  },
  id: {
    type: String,
  },
  wallet: {
    type: String,
  },
  bank: {
    type: String,
  },
  method: {
    type: String,
  },
  international: {
    type: Boolean,
    default: false,
  },
  invoiceId: {
    type: String,
  },
  cardId: {
    type: String,
  },
})

// Create index and enable search on transactions

transactionSchema.pre(/^find/, function (next) {
  this.find({}).populate('customer').populate('order')
  next()
})


transactionSchema.index({
    type: 'text',
    description: 'text',
    status: 'text',
    currency: 'text',
    id: 'text',
  })

const Transaction = new mongoose.model('Transaction', transactionSchema)
module.exports = Transaction

const catchAsync = require('../utils/catchAsync')
const WalletTransaction = require('../model/WalletTransactionModel')

exports.getTransactions = catchAsync(async (req, res, next) => {
  const transactions = await WalletTransaction.find({ store: req.store._id })

  res.status(200).json({
    status: 'success',
    data: transactions,
    message: 'Wallet Transactions found successfully!',
  })
})

const catchAsync = require('../utils/catchAsync')
const Transaction = require('../model/transactionModel')
const apiFeatures = require('../utils/apiFeatures')

exports.getAllTransactions = catchAsync(async (req, res, next) => {
  const query = Transaction.find({ store: req.store._id })

  const features = new apiFeatures(query, req.query).textFilter()
  const transactions = await features.query

  res.status(200).json({
    status: 'success',
    data: transactions,
    message: 'Transactions found successfully!',
  })
})

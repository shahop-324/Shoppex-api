const Store = require('../model/StoreModel')
const catchAsync = require('../utils/catchAsync')

exports.updatePaymentMethod = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const {
    acceptCOD,
    acceptPartialCOD,
    partialCODPercent,
    paymentMode,
    upiId,
    bank,
    accountNo,
    beneficiaryName,
    IFSCCode,
  } = req.body

  const updatedStore = await Store.findByIdAndUpdate(
    id,
    {
      acceptCOD,
      acceptPartialCOD,
      partialCODPercent,
      paymentMode,
      upiId,
      bank,
      accountNo,
      beneficiaryName,
      IFSCCode,
    },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    data: updatedStore,
    message: 'Payment info updated successfully!',
  })
})

exports.getPayments = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const storeTransactions = await Transaction.find({ store: id })

  res.status(200).json({
    data: storeTransactions,
    status: 'success',
    message: 'Store Transactions found successfully!',
  })
});
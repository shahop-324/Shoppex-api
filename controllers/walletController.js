const catchAsync = require("../utils/catchAsync");
const WalletTransaction = require("../model/walletTransactionModel");

exports.getTransactions = catchAsync(async (req, res, next) => {
  const query = WalletTransaction.find({ store: req.store._id });

  const features = new apiFeatures(query, req.query).textFilter();
  const transactions = await features.query;

  res.status(200).json({
    status: "success",
    data: transactions,
    message: "Wallet Transactions found successfully!",
  });
});

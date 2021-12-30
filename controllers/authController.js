const catchAsync = require('../utils/catchAsync')
const User = require('./../model/userModel')

exports.registerUser = catchAsync(async (req, res, next) => {
  // Logic;

  res.status(200).json({
    status: 'success',
  })
})

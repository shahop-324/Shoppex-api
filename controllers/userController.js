const catchAsync = require('../utils/catchAsync')
const User = require('../model/userModel')

exports.getUserDetails = catchAsync(async (req, res, next) => {
  const userDoc = await User.findById(req.user._id)
  res.status(200).json({
    status: 'success',
    data: userDoc,
    message: 'Successfully found user document',
  })
})

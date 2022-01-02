const catchAsync = require('../utils/catchAsync')
const User = require('./../model/userModel')

exports.registerUser = catchAsync(async (req, res, next) => {
  // Logic;

  const newUser = await User.create({
    firstName: 'OP',
    lastName: 'SHAH',
    email: 'op@gmail.com',
  });

  console.log(newUser)

  res.status(201).json({
    status: 'success',
    data: newUser,
  })
})

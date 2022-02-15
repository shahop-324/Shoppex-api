const catchAsync = require('../utils/catchAsync')
const Admin = require('../model/adminModel')
const Blog = require('../model/blogModel')
const Payout = require('../model/payoutModel')
const Refund = require('../model/refundModel')
const Store = require('../model/StoreModel')

// Create Admin
exports.createAdmin = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, phone, password } = req.body

  const newAdmin = await Admin.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    createdAt: Date.now(),
  })

  res.status(200).json({
    status: 'success',
    data: newAdmin,
    message: 'Admin Created Successfully!',
  })
})

// Create Blog
exports.createBlog = catchAsync(async (req, res, next) => {})

// Edit Blog
exports.updateBlog = catchAsync(async (req, res, next) => {})
// Delete Blog
exports.deleteBlog = catchAsync(async (req, res, next) => {})
// Fetch Blogs
exports.fetchBlogs = catchAsync(async (req, res, next) => {})

// Fetch stores
exports.fetchStores = catchAsync(async (req, res, next) => {
  const stores = await Store.find({})

  res.status(200).json({
    status: 'success',
    data: stores,
    message: 'Stores found successfully!',
  })
})

// Fetch Payouts
exports.fetchPayouts = catchAsync(async (req, res, next) => {
  const payouts = await Payout.find({})
  res.status(200).json({
    status: 'success',
    data: payouts,
    message: 'Payouts found successfully!',
  })
})

// Create Payout
exports.createPayout = catchAsync(async (req, res, next) => {})

// Fetch Refunds
exports.fetchRefunds = catchAsync(async (req, res, next) => {
  const refunds = await Refund.find({})
  res.status(200).json({
    status: 'success',
    data: refunds,
    message: 'Refunds found successfully!',
  })
})
// Update Refund
exports.updateRefund = catchAsync(async (req, res, next) => {})

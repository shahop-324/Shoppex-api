const catchAsync = require('../utils/catchAsync')
const Admin = require('../model/adminModel')
const Blog = require('../model/blogModel')
const Payout = require('../model/payoutModel')
const Refund = require('../model/refundModel')
const Store = require('../model/StoreModel')

// Create Admin
exports.createAdmin = catchAsync(async (req, res, next) => {})

// Create Blog
exports.createBlog = catchAsync(async (req, res, next) => {})

// Edit Blog
exports.updateBlog = catchAsync(async (req, res, next) => {})
// Delete Blog
exports.deleteBlog = catchAsync(async (req, res, next) => {})
// Fetch Blogs
exports.fetchBlogs = catchAsync(async (req, res, next) => {})

// Fetch stores
exports.fetchStores = catchAsync(async (req, res, next) => {})

// Fetch Payouts
exports.fetchPayouts = catchAsync(async (req, res, next) => {})

// Create Payout
exports.createPayout = catchAsync(async (req, res, next) => {})

// Fetch Refunds
exports.fetchRefunds = catchAsync(async (req, res, next) => {})
// Update Refund
exports.updateRefund = catchAsync(async (req, res, next) => {})

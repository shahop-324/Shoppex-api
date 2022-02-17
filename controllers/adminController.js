const catchAsync = require('../utils/catchAsync')
const Admin = require('../model/adminModel')
const Blog = require('../model/blogModel')
const Payout = require('../model/payoutModel')
const Refund = require('../model/refundModel')
const Store = require('../model/storeModel')
const randomstring = require('randomstring')

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_KEY)

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)

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
exports.createPayout = catchAsync(async (req, res, next) => {
  // TODO

  const { storeId, amount, method } = req.body

  // Update Amount on hold and Amount paid for store

  const store_doc = await Store.findById(storeId)

  store_doc.amountPaid = store_doc.amountPaid + amount
  store_doc.amountOnHold = store_doc.amountOnHold - amount

  const updatedStore = await store_doc.save({
    new: true,
    validateModifiedOnly: true,
  })

  const new_payout = await Payout.create({
    store: storeId,
    amount: amount,
    currency: 'INR',
    createdAt: Date.now(),
    method,
    payoutId: `pay_${randomstring.generate(10)}`,
    createdBy: req.admin._id,
  })

  // Notify Seller About Payment => Via SMS & EMAIL

  client.messages
    .create({
      body: `Dear QwikShop Seller, Your Payment of Rs. ${amount} for store ${store_doc.name} has been made successfully via registered ${method}. Thanks, QwikShop team.`,
      from: '+1 775 535 7258',
      to: store_doc.phone,
    })

    .then((message) => {
      console.log(message.sid)
      console.log(`Successfully sent SMS Notification`)
    })
    .catch((e) => {
      console.log(e)
      console.log(`Failed to send SMS Notification`)
    })

  res.status(200).json({
    status: 'success',
    payout: new_payout,
    store: updatedStore,
    message: 'Payout Created successfully!',
  })
})

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
exports.resolveRefund = catchAsync(async (req, res, next) => {
  // TODO

  // Mark refund resolved at true => Notify Customer

  const Updated_refund = await Refund.findByIdAndUpdate(
    req.params.id,
    { resolved: true },
    { new: true, validateModifiedOnly: true },
  )

  client.messages
    .create({
      body: `Dear ${Updated_refund.customer.name}, Your Refund of Rs. ${Updated_refund.amount} for Order #${Updated_refund.order._id} placed via ${Updated_refund.store.name} has been made successfully Proccessed. Thanks, ${Updated_refund.store.name} Team.`,
      from: '+1 775 535 7258',
      to: Updated_refund.customer.phone,
    })

    .then((message) => {
      console.log(message.sid)
      console.log(`Successfully sent SMS Notification`)
    })
    .catch((e) => {
      console.log(e)
      console.log(`Failed to send SMS Notification`)
    })

  res.status(200).json({
    status: 'success',
    payout: new_payout,
    store: updatedStore,
    message: 'Payout Created successfully!',
  })

  res.status(200).json({
    status: 'success',
    data: Updated_refund,
    message: 'Refund successfully resolved!',
  })
})

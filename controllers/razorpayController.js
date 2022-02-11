const catchAsync = require('../utils/catchAsync')
const Razorpay = require('razorpay')
const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid')

const razorpay = new Razorpay({
  key_id: 'rzp_live_g0GDGz1KSIjfGz',
  key_secret: 'DAufNVa9IWZcny9Hx12rI52Y',
})

exports.createSubscription = catchAsync(async (req, res, next) => {
  try{
    const newSubscription = await razorpay.subscriptions.create({
      plan_id: req.params.plan_id,
      customer_notify: 1,
      quantity: 1,
      total_count: 1,
      notes: {
        store_id: req.store._id,
      },
    })
  
    res.status(200).json({
      status: 'success',
      message: 'Subscription Created successfully!',
      data: newSubscription,
    })
  }
  catch(error) {
    console.log(error);
  }
  
})

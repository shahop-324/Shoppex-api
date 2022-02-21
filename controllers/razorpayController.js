const catchAsync = require('../utils/catchAsync')
const Razorpay = require('razorpay')
const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid')
const Store = require('../model/storeModel')
const WalletTransaction = require('../model/walletTransactionModel')

const razorpay = new Razorpay({
  key_id: 'rzp_live_JOhvixtFUeoelr',
  key_secret: '9NtgdfOttmGnW2TKwEtvODZP',
})

exports.createSubscription = catchAsync(async (req, res, next) => {
  try {
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
  } catch (error) {
    console.log(error)
  }
})

exports.createQwikShopPremiumOrder = catchAsync(async (req, res, next) => {
  const { plan_id, type } = req.body

  const storeId = req.store._id
  const userId = req.user._id

  let amount = 450

  if (plan_id === 'plan_IxW85OSdILIwpV') {
    amount = 450
  }
  if (plan_id === 'plan_IxW8v5vM36IGIQ') {
    amount = 4500
  }

  const newOrder = razorpay.orders.create(
    {
      // amount: amount * 100,
      amount: 5 * 100,
      currency: 'INR',
      receipt: uuidv4(),
      notes: {
        // Here we can place notes for our reference
        type: 'qwikshop-plan',
        storeId,
        userId,
        plan_id,
      },
    },
    async (error, order) => {
      if (error) {
        console.log(error)
        res.status(400).json({
          status: 'error',
        })
      } else {
        res.status(200).json({
          status: 'success',
          data: order,
        })
      }
    },
  )
})

exports.createWalletOrder = catchAsync(async (req, res, next) => {
  const { amount, type } = req.body

  const storeId = req.store._id
  const userId = req.user._id

  const newOrder = razorpay.orders.create(
    {
      // amount: amount * 100,
      amount: amount * 100,
      currency: 'INR',
      receipt: uuidv4(),
      notes: {
        // Here we can place notes for our reference
        type: 'wallet-recharge',
        amount,
        storeId,
        userId,
        type,
      },
    },
    async (error, order) => {
      if (error) {
        console.log(error)
        res.status(400).json({
          status: 'error',
        })
      } else {
        res.status(200).json({
          status: 'success',
          data: order,
        })
      }
    },
  )
})

exports.processPayment = catchAsync(async (req, res, next) => {
  const secret = 'sbvhqi839pqp’;a;s;sbuhwuhbhauxwvcywg3638228282fhvhyw'

  const paymentEntity = req.body.payload.payment.entity

  const shasum = crypto.createHmac('sha256', secret)
  shasum.update(JSON.stringify(req.body))
  const digest = shasum.digest('hex')

  if (digest === req.headers['x-razorpay-signature']) {
    // This is a legit community plan purchase so process it.
    console.log(req.body.payload.payment.entity)

    const payObject = req.body.payload.payment.entity

    const {
      notes,
      fee,
      tax,
      acquirer_data,
      created_at,
      vpa,
      description,
      order_id,
      status,
      currency,
      amount,
      id,
      wallet,
      bank,
      method,
      international,
      invoice_id,
      card_id,
    } = payObject

    console.log(payObject)

    if (payObject.notes.type === 'wallet-recharge') {
      // Create a wallet Credit transaction and update store wallet total money

      const storeDoc = await Store.findById(notes.storeId)

      storeDoc.walletAmount = storeDoc.walletAmount + (amount / 100).toFixed(0)

      await storeDoc.save({ new: true, validateModifiedOnly: true })

      await WalletTransaction.create({
        transactionId: id,
        type: 'Credit',
        amount: (amount / 100).toFixed(0),
        reason: 'Wallet recharge',
        timestamp: created_at,
        store: notes.storeId,
        user: notes.userId,
        status,
        currency,
        wallet,
        bank,
        method,
        international,
        invoice_id,
        card_id,
        notes,
        fee,
        tax,
      })

      res.status(200).json({
        status: 'success',
        message: 'Payment processed successfully!',
      })
    }

    if (payObject.notes.type === 'qwikshop-plan') {
      const storeId = payObject.notes.storeId
      const userId = payObject.notes.userId
      const plan_id = payObject.notes.plan_id

      const storeDoc = await Store.findById(storeId)

      if (plan_id === 'plan_IxW85OSdILIwpV') {
        storeDoc.currentPlan = 'Monthly'
        storeDoc.currentPlanExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000
        storeDoc.transaction_charge = 2
      }
      if (plan_id === 'plan_IxW8v5vM36IGIQ') {
        storeDoc.currentPlan = 'Yearly'
        storeDoc.currentPlanExpiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000
        storeDoc.transaction_charge = 1
      }

      const updatedStoreDoc = await storeDoc.save({
        new: true,
        validateModifiedOnly: true,
      })

      res.status(200).json({
        status: 'success',
        message: 'Store Plan Purchase proccessed succesfully!',
      })
    }
  } else {
    // This is not genuine => Just pass it
  }
})

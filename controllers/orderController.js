const Order = require('../model/ordersModel')
const Product = require('../model/productModel')
const Customer = require('../model/customerModel')
const Refund = require('../model/refundModel')
const catchAsync = require('../utils/catchAsync')
const apiFeatures = require('../utils/apiFeatures')
const Shipment = require('../model/shipmentModel')
const Store = require('../model/storeModel')
const request = require('request')

const randomstring = require('randomstring')
const WalletTransaction = require('../model/walletTransactionModel')
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)

exports.createOrder = catchAsync(async (req, res, next) => {
  const {
    storeId,
    products,
    amount,
    paymentMode,
    paymentStatus,
    discountCode,
    mobile,
    customerName,
    deliveryAddress,
    deliveryPincode,
    checkoutFields,
    status,
    isDining,
    diningTable,
  } = req.body

  const newOrder = await Order.create({
    store: storeId,
    products,
    amount,
    paymentMode,
    paymentStatus,
    discountCode,
    mobile,
    customerName,
    deliveryAddress,
    deliveryPincode,
    checkoutFields,
    status,
    isDining,
    diningTable,
    isCancelled: false,
    createdAt: Date.now(),
  })

  res.status(200).json({
    status: 'success',
    message: 'Order created successfully!',
    data: newOrder,
  })
})

exports.getOrders = catchAsync(async (req, res, next) => {
  const query = Order.find({ store: req.store._id })

  const features = new apiFeatures(query, req.query).textFilter()
  const orders = await features.query

  res.status(200).json({
    status: 'success',
    data: orders,
    message: 'Orders found successfully!',
  })
})

exports.getAbondonedCarts = catchAsync(async (req, res, next) => {
  const customers = await Customer.find({ store: req.store._id }).select(
    '+cart',
  )

  const products = await Product.find({ store: req.store._id })

  let abondonedCarts = customers
    .filter((el) => el.cart !== undefined && el.cart.length > 0)
    .map((el) => ({
      cart: el.cart.map((item) => {
        const prod = products.find((p) => {
          return p._id.toString() === item.product.toString()
        })
        // console.log(products);
        console.log(item.product.toString())
        // console.log(prod)
        return {
          qty: item.quantity,
          itemTotal: item.quantity * item.pricePerUnit,
          name: prod.productName,
          id: prod._id,
        }
      }),
      name: el.name,
      customerId: el._id,
      contact: el.phone,
      updatedAt: el.cartUpdatedAt || Date.now(),
    }))

  abondonedCarts = abondonedCarts.map((el) => {
    const { name, cart, customerId, contact, updatedAt } = el

    let amount = 0

    cart.forEach((el) => {
      amount = amount + el.itemTotal
    })

    return {
      cart,
      name,
      customerId,
      contact,
      updatedAt,
      amount,
    }
  })

  // * Customer name DONE
  // * Customer Contact DONE
  // * Products with qty, name & _id, DONE
  // * Total Amount of cart DONE
  // * Last Updated time of cart DONE

  res.status(200).json({
    status: 'success',
    data: abondonedCarts,
    message: 'Abondoned carts found successfully!',
  })
})

exports.getRecentOrders = catchAsync(async (req, res, next) => {
  // get latest 6 orders
  const orders = await Order.find({ store: req.store._id })
    .sort({ timestamp: -1 })
    .limit(6)

  res.status(200).json({
    status: 'success',
    data: orders,
    message: 'successfully found latest orders',
  })
})

exports.acceptOrder = catchAsync(async (req, res, next) => {
  //  Move order to packaging state

  const acceptedOrder = await Order.findByIdAndUpdate(
    req.body.id,
    { status: 'Accepted', orderStatus: 'packaging', updatedAt: Date.now() },
    { new: true, validateModifiedOnly: true },
  )

  //  ! TODO Send email, SMS and whatsapp communication that order has been accepted

  res.status(200).json({
    status: 'success',
    data: acceptedOrder,
    message: 'Order Accepted Successfully!',
  })
})

exports.cancelOrder = catchAsync(async (req, res, next) => {
  // Mark order as cancelled => Create a refund if any amount was paid online and reverse coins in order

  // ! Remember to give refund only if it was a prepaid order and also cancel shipment with shiprocket if it was being shipped via shiprocket => Delivery charge will also be refunded

  const cancelledOrder = await Order.findByIdAndUpdate(
    req.body.id,
    { status: 'Cancelled', orderStatus: 'cancelled', updatedAt: Date.now(), reasonForCancellation: req.body.reason, },
    { new: true, validateModifiedOnly: true },
  )

  // Mark corresponding shipment as cancelled

  const cancelledShipment = await Shipment.findByIdAndUpdate(
    cancelledOrder.shipment,
    { status: 'Cancelled', reasonForCancellation: req.body.reason, },
    { new: true, validateModifiedOnly: true },
  )

  const customerDoc = await Customer.findById(cancelledOrder.customer._id)

  customerDoc.coins = (
    customerDoc.coins -
    (cancelledOrder.coinsEarned || 0) +
    (cancelledOrder.coinsUsed || 0)
  ).toFixed(0)

  await customerDoc.save({ new: true, validateModifiedOnly: true })

  const orderDoc = cancelledOrder;

  if (orderDoc.paymentMode !== 'cod') {
    // Calculate total - coinsUsed === amount that needs to be refunded
    const amountToRefund = (
      orderDoc.charges.total - cancelledOrder.coinsUsed
    ).toFixed(2)

    if (amountToRefund * 1 > 0) {
      await Refund.create({
        store: cancelledOrder.store,
        customer: cancelledOrder.customer._id,
        order: cancelledOrder._id,
        amount: amountToRefund,
        createdAt: Date.now(),
      })
    }
  }

  // Check if shipment was booked via shiprocket than cancel that shipment via shiprocket_order_id

  if (cancelledShipment.carrier === 'Shiprocket') {
    // check if their is AWB number booked for this shipment
    if (cancelledShipment.AWB) {
      // Now we need to cancel this order booked via shiprocket

      let token = null

      const options = {
        method: 'POST',
        url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'jyoti.shah@qwikshop.online',
          password: 'op12345@shah',
        }),
      }

      request(options, async (error, response) => {
        if (error) throw new Error(error)
        // console.log(response.body)
        JSON.parse(response.body)
        const resp = await JSON.parse(response.body)

        // console.log(resp.token)

        token = resp.token

        var options = {
          method: 'POST',
          url: 'https://apiv2.shiprocket.in/v1/external/orders/cancel',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ids: [cancelledShipment.shiprocket_order_id],
          }),
        }
        request(options, function (error, response) {
          if (error) throw new Error(error)
          console.log(response.body)

          res.status(200).json({
            message: 'Shipment via shiprocket has been cancelled successfully!',
            status: 'success',
          })
        })
      })
    }
  }

  //  ! TODO Send email, SMS and whatsapp communication that order has been cancelled
  res.status(200).json({
    status: 'success',
    data: cancelledOrder,
    shipment: cancelledShipment,
    message: 'Order Cancelled Successfully!',
  })
})

exports.askForReview = catchAsync(async (req, res, next) => {
  // Check if we have more than 1.5 in our wallet then only allow to send message

  const storeDoc = await Store.findById(req.store._id)

  if (storeDoc.walletAmount > 1.5) {
    // Find customer and order and ask for review

    const orderDoc = await Order.findById(req.params.orderId)

    const storeDoc = await Store.findById(orderDoc.store)

    const customer = orderDoc.customer

    if (customer.phone) {
      // Send SMS here

      client.messages
        .create({
          body: `Dear Customer, Please provide your review for your order ID ${orderDoc.ref.toUpperCase()} which was placed via ${
            storeDoc.name
          }. Thanks.`,
          from: '+1 775 535 7258',
          to: customer.phone,
        })

        .then(async (message) => {
          console.log(message.sid)
          console.log(`Successfully sent SMS asking for review.`)

          // deduct amount from wallet

          storeDoc.walletAmount = storeDoc.walletAmount - 1.5

          await storeDoc.save({ new: true, validateModifiedOnly: true })

          await WalletTransaction.create({
            store: req.store._id,
            transactionId: `pay_${randomstring.generate({
              length: 10,
              charset: 'alphabetic',
            })}`,
            type: 'Debit',
            amount: 1.5,
            reason: 'Asked for review',
            timestamp: Date.now(),
          })

          res.status(200).json({
            status: 'success',
            message: 'Asked for review successfully!',
          })
        })
        .catch((e) => {
          console.log(e)
          console.log(`Failed to send SMS asking for review.`)
          res.status(200).json({
            status: 'success',
            message: 'Failed to Ask for review, Please try again',
          })
        })
    } else {
      res.status(200).json({
        status: 'success',
        message:
          'Failed to Ask for review, customer has not provided their Mobile number. Please update customer.',
      })
    }
  } else {
    res.status(400).json({
      status: 'failed',
      message:
        "You don't have enough wallet balance to ask for review via SMS. Please recharge your wallet.",
    })
  }
})

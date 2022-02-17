const Order = require('../model/ordersModel')
const Product = require('../model/productModel')
const Customer = require('../model/CustomerModel')
const catchAsync = require('../utils/catchAsync')
const apiFeatures = require('../utils/apiFeatures')

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

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.body

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { isCancelled: true },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    message: 'Order cancelled successfully!',
    data: updatedOrder,
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
  const acceptedOrder = await Order.findByIdAndUpdate(
    req.body.id,
    { status: 'Accepted', updatedAt: Date.now() },
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
  const cancelledOrder = await Order.findByIdAndUpdate(
    req.body.id,
    { status: 'Cancelled', orderStatus: 'cancelled', updatedAt: Date.now() },
    { new: true, validateModifiedOnly: true },
  )

  //  ! TODO Send email, SMS and whatsapp communication that order has been accepted
  res.status(200).json({
    status: 'success',
    data: cancelledOrder,
    message: 'Order Cancelled Successfully!',
  })
})

exports.rejectOrder = catchAsync(async (req, res, next) => {
  const rejectedOrder = await Order.findByIdAndUpdate(
    req.body.id,
    { status: 'Rejected', orderStatus: 'cancelled', updatedAt: Date.now() },
    { new: true, validateModifiedOnly: true },
  )

  //  ! TODO Send email, SMS and whatsapp communication that order has been accepted
  res.status(200).json({
    status: 'success',
    data: rejectedOrder,
    message: 'Order Rejected Successfully!',
  })
})
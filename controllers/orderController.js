const Order = require('../model/OrdersModel')
const catchAsync = require('../utils/catchAsync')

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
  const { id } = req.params

  const orders = await Order.find({ store: storeId })

  res.status(200).json({
    status: 'success',
    data: orders,
    message: 'Orders found successfully!',
  })
})

exports.getAbondonedCarts = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const abondonedCarts = await AbondonedCart.find({ store: storeId })

  res.status(200).json({
    status: 'success',
    data: abondonedCarts,
    message: 'Abondoned carts found successfully!',
  })
})

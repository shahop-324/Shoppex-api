const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController')
const orderController = require('../controllers/orderController')

router.get('/recent', authController.protect, orderController.getRecentOrders)

router.get('/getAll', authController.protect, orderController.getOrders)

router.get(
  '/getAbondonedCarts',
  authController.protect,
  orderController.getAbondonedCarts,
)

router.patch('/accept', authController.protect, orderController.acceptOrder)
router.patch('/updateShippingAddress', authController.protect, orderController.editShippingAddress);
router.patch('/cancel', authController.protect, orderController.cancelOrder)
router.post('/request-order-payment/:orderId', authController.protect, orderController.requestOrderPayment);
router.post('/askForReview/:orderId', authController.protect, orderController.askForReview);

module.exports = router

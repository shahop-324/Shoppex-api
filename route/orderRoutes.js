const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController')
const orderController = require('../controllers/orderController')

router.get('/recent', authController.protect, orderController.getRecentOrders)

router.get('/getAll', authController.protect, orderController.getOrders)

router.get('/getAbondonedCarts', authController.protect, orderController.getAbondonedCarts);

module.exports = router

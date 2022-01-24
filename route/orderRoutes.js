const express = require('express')
const router = express.Router()

const authController = require("../controllers/authController");
const orderController = require("../controllers/orderController");

router.get('/recent', authController.protect, orderController.getRecentOrders);

module.exports = router;
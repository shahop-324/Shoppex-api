const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const customerController = require('../controllers/customerController')

router.get(
  '/customers/getAll',
  authController.protect,
  customerController.fetchCustomers,
)

module.exports = router
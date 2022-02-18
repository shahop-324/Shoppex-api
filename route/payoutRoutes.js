const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController')
const payoutController = require('../controllers/payoutController')

router.get('/getAll', authController.protect, payoutController.fetchPayouts)

module.exports = router

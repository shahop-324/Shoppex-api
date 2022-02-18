const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController')
const refundController = require('../controllers/refundController')

router.get('/getAll', authController.protect, refundController.fetchRefunds)

module.exports = router

const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const customerController = require('../controllers/customerController')

router.get('/getAll', authController.protect, customerController.fetchCustomers)

router.post(
  '/create',
  authController.protect,
  customerController.addNewCustomer,
)

router.patch('/update/:id', authController.protect, customerController.updateCustomer)

router.delete('/delete/:id', authController.protect, customerController.deleteCustomer);

router.post('/sendSMS', authController.protect, customerController.sendSMSToCustomer);

router.post('/addCoins', authController.protect, customerController.giveCoinsToCustomer);

module.exports = router

const express = require('express');
const router = express.Router();
const authController = require("../controllers/authController");
const razorpayController = require("../controllers/razorpayController");

router.post('/createSubscription/:plan_id', authController.protect, razorpayController.createSubscription);

router.post('/createWalletOrder', authController.protect, razorpayController.createWalletOrder);

router.post('/createQwikShopPremiumOrder', authController.protect, razorpayController.createQwikShopPremiumOrder);

router.post('/paymentRecieved', razorpayController.processPayment);

module.exports = router
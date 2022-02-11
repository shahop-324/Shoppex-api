const express = require('express');
const router = express.Router();
const authController = require("../controllers/authController");
const razorpayController = require("../controllers/razorpayController");

router.post('/createSubscription/:plan_id', authController.protect, razorpayController.createSubscription);

module.exports = router
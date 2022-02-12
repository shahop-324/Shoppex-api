const express = require('express');
const router = express.Router();

const authController = require("../controllers/authController");
const walletController = require("../controllers/walletController");

router.get('/getTransactions', authController.protect, walletController.getTransactions);

module.exports = router;
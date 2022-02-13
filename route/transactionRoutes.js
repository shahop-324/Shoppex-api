const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");
const transactionController = require("../controllers/transactionController");

router.get('/getAll', authController.protect, transactionController.getAllTransactions);

module.exports = router;
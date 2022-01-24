const express = require('express')
const router = express.Router()

const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

router.get('/getDetails', authController.protect, userController.getUserDetails);

module.exports = router;
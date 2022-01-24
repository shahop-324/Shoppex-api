const express = require('express')
const router = express.Router()

const generalController = require("../controllers/generalController");
const authController = require("../controllers/authController");

router.get('/getSubnames', authController.protect, generalController.getSubnames);

router.post('/sendSMS', generalController.sendSMSMessage);

module.exports = router;
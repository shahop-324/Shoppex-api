const express = require('express')
const authController = require("../controllers/authController");
const appController = require("../controllers/appController");

const router = express.Router()

router.post('/getSignedURL', authController.protect, appController.generateUploadURL);

module.exports = router;
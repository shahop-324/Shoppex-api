const express = require('express')
const authController = require('./../controllers/authController')

const router = express.Router()

router.post('/registerUser', authController.registerUser)

module.exports = router;

// User signin, sign up, edit, delete

const express = require('express')
const authController = require('../controllers/authController')

const router = express.Router()

router.post('/register', authController.register, authController.resendEmailVerificationOTP);

router.post('/verify-email', authController.verifyOTPForRegistration);

router.post('/login', authController.loginUser);

router.post('/resend-email-otp', authController.resendEmailVerificationOTP);

router.patch('/update-password', authController.protect, authController.updatePassword);

module.exports = router;

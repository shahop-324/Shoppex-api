// User signin, sign up, edit, delete

const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post(
  "/register",
  authController.register,
  authController.resendEmailVerificationOTP
);

router.post("/verify-email", authController.verifyOTPForRegistration);

router.post("/login", authController.loginUser);

router.post("/admin/login", authController.loginAdmin);

router.post("/resend-email-otp", authController.resendEmailVerificationOTP);

router.patch(
  "/update-password",
  authController.protect,
  authController.updatePassword
);
router.post("/mobile/forgot-password", authController.forgotEmailPassword);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-forgot-email", authController.verifyForgotEmailPassword);
router.post("/resend-forgot-email-otp", authController.forgotEmailPassword);
router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;

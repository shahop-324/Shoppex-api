const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController')
const adminController = require('../controllers/adminController')

router.post(
  '/blog/create',
  authController.protectAdmin,
  adminController.createBlog,
)

module.exports = router

const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const reviewController = require('../controllers/reviewController')

router.get(
  '/review/getAll',
  authController.protect,
  reviewController.fetchReviews,
)

module.exports = router
const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const reviewController = require('../controllers/reviewController')

router.get(
  '/getAll',
  authController.protect,
  reviewController.fetchReviews,
)
router.patch(
  '/update/:id',
  authController.protect,
  reviewController.updateReview,
)

module.exports = router
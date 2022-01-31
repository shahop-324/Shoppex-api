const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const marketingController = require('../controllers/marketingController')

router.get(
  '/marketing/getAll',
  authController.protect,
  marketingController.fetchCampaigns,
)

module.exports = router
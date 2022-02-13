const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const marketingController = require('../controllers/marketingController')

router.get(
  '/marketing/getAll',
  authController.protect,
  marketingController.fetchCampaigns,
)


router.post('/create/email', authController.protect, marketingController.createMailCampaign);
module.exports = router
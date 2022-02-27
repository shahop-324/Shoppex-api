const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const marketingController = require('../controllers/marketingController')

router.get(
  '/getAll',
  authController.protect,
  marketingController.fetchCampaigns,
)
router.post(
  '/create/email',
  authController.protect,
  marketingController.createMailCampaign,
)
router.post(
  '/create/sms',
  authController.protect,
  marketingController.createSMSCampaign,
)
router.patch(
  '/update/mail/:id',
  authController.protect,
  marketingController.updateMailCampaign,
)
router.patch(
  '/update/sms/:id',
  authController.protect,
  marketingController.updateSMSCampaign,
)
router.patch(
  '/send/mail/:id',
  authController.protect,
  marketingController.sendEmailCampaign,
)
router.patch(
  '/send/sms/:id',
  authController.protect,
  marketingController.sendSMSCampaign,
)

module.exports = router

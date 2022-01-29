const express = require('express')
const router = express.Router()

const storeController = require('../controllers/storeController')
const authController = require('../controllers/authController')

router.get(
  '/getDetails',
  authController.protect,
  storeController.getStoreDetails,
)
router.post('/setup', authController.protect, storeController.setupStore) // For first time store setup
router.patch(
  '/update/paymentSettings',
  authController.protect,
  storeController.updatePaymentSettings,
)

// Manage Routes
router.patch(
  '/manage/favicon',
  authController.protect,
  storeController.updateFavicon,
)
router.patch(
  '/manage/seo',
  authController.protect,
  storeController.updateStoreSEO,
)
router.patch(
  '/manage/self-delivery-zone',
  authController.protect,
  storeController.updateSelfDeliveryZone,
)
router.patch(
  '/manage/manage-charges',
  authController.protect,
  storeController.updateManageCharges,
)
router.patch(
  '/manage/store-timing',
  authController.protect,
  storeController.updateStoreTimings,
)

module.exports = router

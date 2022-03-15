const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController')
const referralController = require('../controllers/referralController')

router.get('/getAll', authController.protect, referralController.fetchReferrals)

router.post(
  '/fetchReferralPurchases',
  authController.protect,
  referralController.fetchReferralPurchases,
)
router.patch(
  '/updateReferralPurchase/:id',
  authController.protect,
  referralController.updateReferralPurchase,
)

router.post(
  '/create',
  authController.protect,
  referralController.addNewReferral,
)

router.patch(
  '/update/:id',
  authController.protect,
  referralController.editReferral,
)

router.delete(
  '/delete/:id',
  authController.protect,
  referralController.deleteReferral,
)

router.patch(
  '/deleteMultiple',
  authController.protect,
  referralController.deleteMultipleReferral,
)

router.post('/bulkImport', authController.protect, referralController.bulkImportReferrals);
router.post('/bulkUpdate', authController.protect, referralController.bulkUpdateReferrals);

module.exports = router

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

router.patch(
  '/policy/update',
  authController.protect,
  storeController.updatePolicy,
)

router.patch(
  '/notification/update',
  authController.protect,
  storeController.updateNotifications,
)

router.patch(
  '/social-links/update',
  authController.protect,
  storeController.updateSocialLinks,
)

router.patch(
  '/general/update',
  authController.protect,
  storeController.updateGeneralStoreInfo,
)

router.patch('/general/guest-checkout', authController.protect, storeController.updateGuestCheckout);

router.patch('/notification/update', authController.protect, storeController.updateNotifications);

router.patch('/social-links/update', authController.protect, storeController.updateSocialLinks);

// Staff
router.post('/staff/create', authController.protect, storeController.addStaffMember);

router.patch('/staff/update/:email', authController.protect, storeController.editStaffMember);

router.patch('/staff/delete/:email', authController.protect, storeController.removeStaffMember);

// Checkout form fields

router.post('/checkout-form/create', authController.protect, storeController.addCheckoutField)

router.patch('/checkout-form/update/:fieldId', authController.protect, storeController.editCheckoutField);

router.patch('/checkout-form/delete/:fieldId', authController.protect, storeController.deleteCheckoutField);

// Store other info

router.patch('/other-info/update', authController.protect, storeController.updateStoreOtherInfo);
router.patch('/ambience/update', authController.protect, storeController.updateStoreAmbience);
router.patch('/updateTheme/:theme', authController.protect, storeController.updateStoreTheme);
router.patch('/update', authController.protect, storeController.updateStore);
module.exports = router

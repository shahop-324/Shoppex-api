const express = require("express");
const router = express.Router();

const storeController = require("../controllers/storeController");
const authController = require("../controllers/authController");
const manageController = require("../controllers/manageController");

router.get(
  "/getDetails/:storeId?",
  authController.protect,
  storeController.getStoreDetails
);
router.post("/setup", authController.protect, storeController.setupStore); // For first time store setup
router.post("/createNew", authController.protect, storeController.createNew); // Create new store
router.post(
  "/generatePolicy",
  authController.protect,
  storeController.generatePolicy
); // Auto generate policies
router.patch(
  "/preference/update",
  authController.protect,
  storeController.updatePreference
); // Update store preferences
router.patch(
  "/policyPreference/update",
  authController.protect,
  storeController.updatePolicyPreference
); // Update policy preferences
router.patch(
  "/update/paymentSettings",
  authController.protect,
  storeController.updatePaymentSettings
);

// Manage Routes
router.patch(
  "/manage/order-flow",
  authController.protect,
  manageController.updateOrderFlow
);

router.patch(
  "/manage/share-message",
  authController.protect,
  manageController.updateShareMessage
);

router.patch(
  "/manage/favicon",
  authController.protect,
  storeController.updateFavicon
);
router.patch(
  "/manage/seo",
  authController.protect,
  storeController.updateStoreSEO
);
router.patch(
  "/manage/self-delivery-zone",
  authController.protect,
  storeController.updateSelfDeliveryZone
);
router.patch(
  "/manage/manage-charges",
  authController.protect,
  storeController.updateManageCharges
);
router.patch(
  "/manage/store-timing",
  authController.protect,
  storeController.updateStoreTimings
);

router.patch(
  "/policy/update",
  authController.protect,
  storeController.updatePolicy
);

router.patch(
  "/notification/update",
  authController.protect,
  storeController.updateNotifications
);

router.patch(
  "/social-links/update",
  authController.protect,
  storeController.updateSocialLinks
);

router.patch(
  "/general/update",
  authController.protect,
  storeController.updateGeneralStoreInfo
);

router.patch(
  "/general/guest-checkout",
  authController.protect,
  storeController.updateGuestCheckout
);

router.patch(
  "/notification/update",
  authController.protect,
  storeController.updateNotifications
);

router.patch(
  "/social-links/update",
  authController.protect,
  storeController.updateSocialLinks
);

// Staff
router.post(
  "/staff/create",
  authController.protect,
  storeController.addStaffMember
);

router.patch(
  "/staff/update/:email",
  authController.protect,
  storeController.editStaffMember
);

router.patch(
  "/staff/delete/:email",
  authController.protect,
  storeController.removeStaffMember
);

// Checkout form fields

router.post(
  "/checkout-form/create",
  authController.protect,
  storeController.addCheckoutField
);

router.patch(
  "/checkout-form/update/:fieldId",
  authController.protect,
  storeController.editCheckoutField
);

router.patch(
  "/checkout-form/delete/:fieldId",
  authController.protect,
  storeController.deleteCheckoutField
);

// Store other info

router.patch(
  "/other-info/update",
  authController.protect,
  storeController.updateStoreOtherInfo
);
router.patch(
  "/ambience/update",
  authController.protect,
  storeController.updateStoreAmbience
);
router.patch(
  "/updateTheme/:theme",
  authController.protect,
  storeController.updateStoreTheme
);
router.patch("/update", authController.protect, storeController.updateStore);
router.post(
  "/switch/:storeId",
  authController.protect,
  storeController.switchStore
);
router.post(
  "/updateBanners",
  authController.protect,
  storeController.updateBanner
);
router.post(
  "/updateHeroBanners",
  authController.protect,
  storeController.updateHeroBanner
);
router.post(
  "/updateCustomBanners",
  authController.protect,
  storeController.updateCustomBanner
);
router.post(
  "/updateImageBanners",
  authController.protect,
  storeController.updateImageBanner
);
router.post(
  "/updateCustomSections",
  authController.protect,
  storeController.updateCustomSections
);
router.post(
  "/updateWhatsAppNumber",
  authController.protect,
  storeController.updateWhatsAppNumber
);
router.post(
  "/verifyWhatsAppNumber",
  authController.protect,
  storeController.verifyWhatsAppNumber
);
router.patch("/updateGA", authController.protect, storeController.updateGA);
router.patch("/updateGMC", authController.protect, storeController.updateGMC);
router.patch("/updateGSC", authController.protect, storeController.updateGSC);
router.patch(
  "/updateIntercom",
  authController.protect,
  storeController.updateIntercom
);
router.patch(
  "/updatePixel",
  authController.protect,
  storeController.updateFBPixel
);
router.patch(
  "/updateAdwords",
  authController.protect,
  storeController.updateAdwords
);
router.patch(
  "/uninstallMailchimp",
  authController.protect,
  storeController.uninstallMailchimp
);
module.exports = router;

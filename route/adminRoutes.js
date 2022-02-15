const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController')
const adminController = require('../controllers/adminController')

router.post('/create', adminController.createAdmin);

router.get('/store/getAll', authController.protectAdmin, adminController.fetchStores);
router.get('/payout/getAll', authController.protectAdmin, adminController.fetchPayouts);
router.get('/refund/getAll', authController.protectAdmin, adminController.fetchRefunds);

router.post(
  '/blog/create',
  authController.protectAdmin,
  adminController.createBlog,
)

router.post('/payout/create', authController.protectAdmin, adminController.createPayout);

router.post('/refund/resolve/:id', authController.protect, adminController.resolveRefund)

module.exports = router

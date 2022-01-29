const express = require('express');
const router = express.Router();

const discountController = require('../controllers/discountController');
const authController = require('../controllers/authController');

router.post('/create', authController.protect, discountController.addDiscount);
router.get('/getAll', authController.protect, discountController.getDiscounts);
router.patch('/update/:discountId', authController.protect, discountController.updateDiscount);
router.delete('/delete/:discountId', authController.protect, discountController.deleteDiscount);

module.exports = router;
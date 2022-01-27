const express = require('express')
const router = express.Router()
const productController = require('./../controllers/productController')
const authController = require("../controllers/authController");

router.post('/create', authController.protect, productController.addProduct);
router.get('/getAll', authController.protect, productController.getProducts);
router.post('/reorder', authController.protect, productController.reorderProducts);
router.patch('/update/:productId', authController.protect, productController.updateProduct);
router.delete('/delete/:productId', authController.protect, productController.deleteProduct);
router.delete('/deleteMultiple', authController.protect, productController.deleteMultipleProduct);

module.exports = router;

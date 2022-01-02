const express = require('express')
const router = express.Router()
const productController = require('./../controllers/productController')

router.post('/createProduct', productController.createNewProduct)

router.get('/getAllMobile', productController.getAllProducts);

router.delete("/deleteProduct", productController.deleteProduct);

module.exports = router;

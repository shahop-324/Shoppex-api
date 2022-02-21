const express = require('express')
const router = express.Router()

const categoryController = require("../controllers/categoryController");
const authController = require("../controllers/authController");

router.get('/getAll', authController.protect, categoryController.getCategories);
router.post('/create', authController.protect, categoryController.addCategory);
router.post('/reorder', authController.protect, categoryController.reorderCategories);
router.patch('/update/:categoryId', authController.protect, categoryController.updateCategory);
router.patch('/updateStock/:categoryId', authController.protect, categoryController.updateCategoryStock);
router.delete('/delete/:categoryId', authController.protect, categoryController.deleteCategory);
router.delete('/deleteMultiple', authController.protect, categoryController.deleteMultipleCategory);

module.exports = router;
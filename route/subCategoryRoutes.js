const express = require('express')
const router = express.Router()

const subCategoryController = require("../controllers/subCategoryController");
const authController = require("../controllers/authController");

router.get('/getAll', authController.protect, subCategoryController.getSubCategories);
router.post('/create', authController.protect, subCategoryController.addSubCategory);
router.post('/reorder', authController.protect, subCategoryController.reorderSubCategories);
router.patch('/update/:categoryId', authController.protect, subCategoryController.updateSubCategory);
router.delete('/delete/:categoryId', authController.protect, subCategoryController.deleteSubCategory);
router.delete('/deleteMultiple', authController.protect, subCategoryController.deleteMultipleSubCategory);

module.exports = router;
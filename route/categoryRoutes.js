const express = require('express')
const router = express.Router()

const categoryController = require("../controllers/categoryController");
const authController = require("../controllers/authController");

router.get('/getAll', authController.protect, categoryController.getCategories);
router.post('/create', authController.protect, categoryController.addCategory);
router.patch('/update/:categoryId', authController.protect, categoryController.updateCategory);
router.delete('/delete/:categoryId', authController.protect, categoryController.deleteCategory);

module.exports = router;
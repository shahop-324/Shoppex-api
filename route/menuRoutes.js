const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController')
const menuController = require('../controllers/menuController')

router.get('/getAll', authController.protect, menuController.getMenu)

router.post('/create', authController.protect, menuController.createMenuItem)

router.patch(
  '/update/:menuId',
  authController.protect,
  menuController.updateMenuItem,
)

router.delete(
  '/delete/:menuId',
  authController.protect,
  menuController.deleteMenuItem,
)

module.exports = router
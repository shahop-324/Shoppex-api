const express = require('express')
const router = express.Router()

const storeController = require('../controllers/storeController')
const authController = require('../controllers/authController')

router.get('/getDetails', authController.protect, storeController.getStoreDetails);
router.post('/setup', authController.protect, storeController.setupStore) // For first time store setup

module.exports = router;

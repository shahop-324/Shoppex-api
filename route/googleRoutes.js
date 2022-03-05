const express = require('express')
const router = express.Router()
const googleController = require('../controllers/googleController');

router.post('/login', googleController.login);

router.post('/register', googleController.register);

module.exports = router;